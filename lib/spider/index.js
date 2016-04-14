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

var Spider = function(options){
  EventEmiter.call(this);
  this.options = options || {};
  this.id = scrapy.genUuid();
  this.filters = [];
  this.scheduler = this.options.scheduler;
  this.downloader = this.options.downloader;
  this.extractor = this.options.extractor;
  this.pipelines = this.options.pipelines || [];

  //runtime vars
  this.cookies = {};
  this.data = [];
}
util.inherit(Spider, EventEmiter);

Spider.prototype = {
    EVENTS: [
      'init' , 'login', 'fetch', 'extract', 'export', 'end'
    ],

	//��¼����
	login: function(username, password){
		this.emit('login', {step: 'begin', sid: username});
		this.emit('login', {step: 'checkcode', sid: username});
		this.emit('login', {step: 'smscode', sid: username});
		this.emit('login', {step: 'end', sid: username});
	},

	//��ȡ����
	fetch: function(){
		this.emit('fetch', {step: 'begin', sid: username});
		this.emit('fetch', {step: 'data', sid: username});
		this.emit('fetch', {step: 'end', sid: username});
	},

	// ������ȡ����
	extract: function(){

	},

	// �������ݣ����絼����db/fs/net
	exportTo: function(target){
		
	},

    //��ʼ�ɼ�����
    start: function(){
        this.emit('init', this);
        this.login(this.getUsername(), this.getPassword());
		this.fetch();
		this.emit('end', this.data);
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
