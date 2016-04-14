/**
 * ����һ���ɼ��������̣���ʼ�� -> ��¼ -> �ɼ� -> ���� -> �洢 -> ���
 * ʵ����Spider�����ʼ��һ�����̣�ÿ�����̶���һ��Ψһ�ı�ʶid���������н׶ζ��ṫ��ͬһ��id
 * ���̷�Ϊ6���׶Σ�ÿ���׶ζ�������5��״̬��doing, waiting_input, done_succ, done_failure, done_timeout
 * ÿ���׶��н��ȱ�ʶ��progress�����ڼ�¼��ǰ�׶ε����̽��ȣ�ȡֵ0-100
 * ÿ���׶��й������������������̿�ʼ�ͽ���ʱ������
 */
require('./lang');
var scrapy = require('./base');
var ResultItems = require('./resultitems');
var Downloader = require('./downloader');
var Extractor = require('./extractor');
var Pipeline = require('./pipeline');
var ProxyRouter = require('../proxyrouter');
var Scheduler = require('../scheduler');

var EventEmiter = require('events');

var Spider = function(options){
  EventEmiter.call(this);
  this.id = scrapy.genUuid();
  this.options = options || {};
  
  this.filters = options.filters || [];
  this.scheduler = this.options.scheduler || new Schduler(this);
  this.downloader = this.options.downloader || new Downloader(this);
  this.extractor = this.options.extractor || new Extractor(this);
  this.pipeline = this.options.pipeline || new Pipeline(this);

  //runtime vars
  this.cookies = {};
  this.data = new ResultItems(this);
}
util.inherit(Spider, EventEmiter);

Spider.STAGES = ['init' , 'login', 'fetch', 'extract', 'export', 'end'];
Spider.STATUSES = ['waiting_input', 'doing', 'done_succ', 'done_failure', 'done_timeout'];

Spider.prototype = {
	//��ʼ��
	assembly: function(){
		this.emit('init', this.id);
		return this;
	}
	
   //��¼����: before and after �¼����Ի���filter������ʵ��
	login: function(username, password){
		this.emit('login', this.id);
		this.emit('login', {step: 'begin', sid: username}); 
		this.emit('login', {step: 'input', type: 'img', sid: username});
		this.emit('login', {step: 'input', type: 'sms', sid: username});
		this.emit('login', {step: 'input', type: 'pwd', sid: username});
		this.emit('login', {step: 'end', sid: username});
		return this;
	},

	//��ȡ����
	fetch: function(){
		this.emit('fetch', this.id);
		this.emit('fetch', {step: 'begin', sid: username});
		this.emit('fetch', {step: 'data', sid: username});
		this.emit('fetch', {step: 'end', sid: username});
		return this;
	},

	// ������ȡ����
	extract: function(){
		this.emit('extract', this.id);
		return this;
	},

	// �������ݣ����絼����db/fs/net
	pipe: function(target){
		this.emit('export', this.id);
		return this;
	},

	//�����׶�
	end: function(){
		this.emit('end', this.id);
		return this;
	}
	
    //��ʼ�ɼ�����
    start: function(){
        this.assembly()
			.login(this.getUsername(), this.getPassword());
			.fetch();
			.extract();
			.pipe();
			.end();
    }

}

//expose class/functions
scrapy.extend(scrapy, {
	ResultItems: ResultItems,
	Downloader: Downloader,
	Extractor: Extractor,
	Pipeline: Pipeline,
	ProxyRouter: ProxyRouter,
	Scheduler: Scheduler
});
module.exports = scrapy;
