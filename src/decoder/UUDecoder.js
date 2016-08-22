/**
 * ������ͼƬ������
 */
'use strict';

import { util } from 'util';
import { Stream } from 'stream';
import { co } from 'co';
import { scrapy } from '../base';

export default class UUDecoder extends ImageDecoder{
	constructor(opts){
		super(opts || {retryTimes: 3});
		this.options = this.loadConfig('uucode');
		this.isLogined = false;
		this.loginUrl = '';
		this.uploadUrl = '';
		this.resultUrl = '';
	}
	
	//����������API������ڻ�ȡ��������ַ�б�
    _getServerAddresses: function *(){
        var resp = yield this.httpClient.get(this.options.endpoint);
		if(resp.error){
			scrapy.raise('uucode-failure', 'Get uucode server addresses failure!');
		}
		if(resp.content && resp.content.contains(',')){
			var tokens = resp.content.split(',');
			this.timeout = parseInt(tokens.shift(), 10);
			for(var i=0; i<tokens.length; i++){
			// _.each(tokens, function(token){
				var addrs = (tokens[i].match(/^(.*)[:]([\d]+)$/)||[]);
				if (addrs[1] && addrs[2]) {
					this._buildAddrs(addrs[2], addrs[1]);
				}
			}
		}

		scrapy.notEmpty(this.loginUrl, 'loginUrl-is-required', '��ȡ�����Ʒ�������½��ַ�б�ʧ��');
		scrapy.notEmpty(this.uploadUrl, 'uploadUrl-is-required', '��ȡ�����Ʒ������ϴ���ַ�б�ʧ��');
		scrapy.notEmpty(this.resultUrl, 'resultUrl-is-required', '��ȡ�����Ʒ����������ַ�б�ʧ��');
    }

	_buildAddrs: function(code, addr){
		switch(code){
			case '101': this.loginUrl = util.format('http://%s/Upload/Login.aspx', addr);
			case '102': this.uploadUrl = util.format('http://%s/Upload/Processing.aspx', addr);
			case '103': this.resultUrl = util.format('http://%s/Upload/GetResult.aspx', addr);
		}
	}

    //md5����
    _md5: function(a, toUpperCase){
        var str;
        if(_.isArray(a)){
            str = _.reduce(a, function(memo, i){
                if(toUpperCase){
                    i = i.toUpperCase();
                }
                memo += i;
            }, '');
        }
        else{ //a is string
            if(toUpperCase) a = a.toUpperCase();
            str = a;
        }
        return scrapy.md5(str);
    }

    //������¼url
    _buildLoginUrl: function(endpoint, username, passwd){
        return util.format('%s?U=%s&p=%s', endpoint, username, this._md5(passwd));
    }

    //������¼��httpͷ
    _buildLoginHeader: function(){
		if(_.isNotEmpty(this.loginHeader)){
			return this.loginHeader;
		}
        var softkey = this.options.softkey.toUpperCase();
        var username = this.options.username.toUpperCase();
        this.loginHeader = {
            "Accept": 'text/html, application/xhtml+xml, */*',
			"Accept-Language": 'zh-CN',
			"Connection": 'Keep-Alive',
			"Cache-Control": 'no-cache',
    	    "SID"       : this.options.sid,
    	    "HASH"      : this._md5(this.options.sid + softkey),
    	    "UUVersion" : this.options.version,
    	    "UID"       : "100" ,
    	    "User-Agent" : this._md5(softkey + "100"),
            "KEY"       : this._md5(softkey + username) + this.options.mac
    	};
		return this.loginHeader;
    }

    //�����ύͼƬ�ı�
    _buildProcessingForm: function(userkey){
        this.processingForm = {
            "Version" : "100",
            "TimeOut" : 60*1000,
            "Type" : '1004', //Ĭ��4λӢ����ĸ��
            "SID" : this.options.sid,
            "KEY": userkey.toUpperCase(),
			"SKEY": this._md5(userkey.toLowerCase() + this.options.sid + this.options.softkey)
        };
        return this.processingForm;
    }

    //��¼�����Ʒ���
    _login: function *(){
		if(this.logined){
			this.logger.warn('login uuwise before, ignored!');
			return;
		}
        var loginUrl = this._buildLoginUrl(this.loginUrl, this.options.username, this.options.password);
		var options = {
			headers: this._buildLoginHeader()
		};
		var resp = yield this.httpClient.get(loginUrl, options);
		if (resp.error || resp.statusCode != 200 || !resp.content || resp.content.length < 10) {
			scrapy.raise('invalid-response', "��½ͼƬ��֤������ʧ��");
		}
        this.loginCookies = resp.cookies;

		var userkey = resp.content;
		var matched = resp.content.match( /([^_]+).*/);
		if(!matched) {
			scrapy.raise('login-failure', "��½ͼƬ��֤������ʧ��:" + resp.content);
		}

		var uid = matched[1];
		_.extend(this.loginHeader, {
			"UID": uid,
			"User-Agent": this._md5(this.options.softkey.toUpperCase()+uid)
		});
        this._buildProcessingForm(userkey);
		this.logined = true;
		return this;
    }

    //�ϴ�ͼƬ�������Ʒ�����
    _uploadImg: function *(imgBuf, type){
        var options = {
            headers: _.omit(this.loginHeader, 'KEY'),
            formData: _.extend(this.processingForm, {
                "Type" : type||'1004', //Ĭ��4λӢ����ĸ��
                "IMG": {
                    value: imgBuf,
                    options: {
                        filename: 'capacha.jpg',
                        contentType: 'image/jpg',
                        knownLength: imgBuf.length
                    }
                }
            })
        };
        var resp = yield this.httpClient.post(this.uploadUrl, options);
		if(resp.error || resp.statusCode !== 200 || !resp.content){
			datag.raise('validate-image-failed', 'ͼƬ��֤ʧ��!');
		}
		var content = resp.content;
        this.logger.debug('response of processing: ', content);
		var tokens = content.split("|") ;
		if (tokens[0] === '-12003' ) {
			datag.raise('login-required', "��½ͼƬ��֤������ʧ��");
		}
		else if(tokens[1]){
			return tokens[1];
		}
        else{
            return this._getResult(tokens[0]);
        }
    }

    //����getResult��ַ
    _buildGetResultUrl: function(token){
        return this.resultUrl + '?key=' + this.processingForm.KEY + '&ID=' + token;
    }

	//��ȡ������:����10��
    _getResult: function *(token){
        var ret='';
		// let's try 10 times
		for (var retriedTimes=0; retriedTimes<10 && !ret; retriedTimes++) {
            //�ȴ�1s
            datag.sleep(500);
            var options = {
                headers: _.omit(this.loginHeader, 'KEY'),
                cookies: this.loginCookies
            };
            this.logger.info('�ȴ���������[%s]��...', retriedTimes+1);
			var resp = yield this.httpClient.get(this._buildGetResultUrl(token), options);
			if (resp.error || resp.statusCode != 200 || !resp.content) {
				datag.raise('invalid-response', "��ȡͼƬ��֤���ʧ��");
			}
			ret = resp.content ;
            this.logger.info('response of getResult: ', ret);
			if(ret.match(/^[-]\d+$/)){
				ret = '' ;
				continue ;
			}
            else {
				break ;
			}
		}
        return ret;
    }

	//ͼƬ����
	decode(resource, type){
		if(Buffer.isBuffer(resource)){
			return this.decodeBuffer(resource, type);
		}
		else if(resource instanceof Stream){
			
		}
	}
	
    //��ͼƬ��ַ���н���
    * decodeUrl(imgurl, type){
        this.logger.info('decode image: %s', imgurl);
        var resp = yield this.httpClient.get(imgurl);
		if(resp.error) datag.raise('invalid-imgurl', 'invalid image url');
        return this.decodeBuffer(new Buffer(resp.content), type);
    }
    
    //��ͼƬ�ֽ������н���
    decodeBuffer(buf, type){
        this.logger.info('decode image buffer...');
        datag.notNull(buf, 'invalid-image', 'ͼƬ��Ϊ��!');
        var ret;
        try{
    		if(!this.logined){
    			this._getServerAddresses();
    			this._login();
    		}
    		type = type || '1004';
    		ret = this._uploadImg(buf, type);
        }
        catch(e){
            //���µ�¼
            if(e.code === 'login-required'){
                this.logined = false;
                this.decodeBuffer(buf, type);
            }
            this.logger.error('ͼƬ����ʧ��', e);
        }
        this.logger.info('image code: %s', ret);
		return ret||'';
    }
		
	decodeStream(stream, type){
		scrapy.raise('not-implemented', 'decodeStream is not implemented!');
	}
}