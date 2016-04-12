'use strict';

//3rd party libs
var _ = require('underscore');
var moment = require('moment');

/**
 * Javascript���Բ������չ
 */
 //===========================================�ַ�������
//�ж�string��ʼ��ĸ�Ƿ�ƥ��
String.prototype.startsWith = function(suffix) {
    return this.indexOf(suffix,0) === 0;
}

//�ж�string��ʼ��ĸ�Ƿ�ƥ��
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

// ȥ��ǰ��ո��
String.prototype.trim= function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.strip = function(){
	return this.replace(/(^\/*)|(\/*$)/g, '');
}
String.prototype.lstrip = function(){
	return this.replace(/(^\/*)/g, '');
}
String.prototype.rstrip = function(){
	return this.replace(/(\/*$)/g, '');
}

//�ж��Ƿ����ĳ����
String.prototype.contains = function(word){
	return this.indexOf(word) >= 0;
}

//���ݿ�ʼ�ַ�����ȡ���������ַ���
String.prototype.substr2 = function(startStr, length){
	var startPos = this.indexOf(startStr) + startStr.length;
	if(startPos >= 0 && length > 0){
		return this.substr(startPos, length);
	}
	return "";
}

//���ݿ�ʼ�ַ����ͽ����ַ�����ȡ�м��
String.prototype.between = function(startStr, endStr){
	var startPos = this.indexOf(startStr) + startStr.length;
	var endPos = this.indexOf(endStr);
	if(startPos >= 0 && endPos < this.length){
		return this.substring(startPos, endPos);
	}
	return "";
}
//����������ʽ��ȡָ�����ַ�
String.prototype.regexp = function(expr, index){
	var matched = this.match(expr);
	if(matched && matched[index]){
		return matched[index];
	}
	return "";
}

//����������ʽ��ȡ����
String.prototype.regex = function(expression, index){
    var content = this;
    var index = parseInt(index, 10);
    if(index==0) index=1;
    var expression = new RegExp(expression,"ig");
    if(index>0){
        var matched = expression.exec(content);
        if(matched&&matched.length>index)return matched[index];
    }else{
        var arr = [],matched;
        while (matched = expression.exec(content))
            arr.push(matched[1]);
        return arr;
    }
}

//=========================================================���ں���
Date.DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";
Date.DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
Date.DEFAULT_MONTH_FORMAT = "YYYY-MM";

if(!Date.inst){
    Date.inst = function(){
        return new Date();
    }
}
if(!Date.now){
	Date.now = function(){
		return (new Date()).getTime();
	};
}
if(!Date.timestamp){
	Date.timestamp = function(){
		return (new Date()).getTime();
	}
}
if(!Date.parse){
	Date.parse = function(d, format){
		format = format || Date.DEFAULT_DATETIME_FORMAT;
		return moment(d, format).toDate();
	}
}
Date.clone = function(d){
	return moment(d).clone().toDate();
}

//for internal use
Date.prototype.toMoment = function(format){
	if(!this.__moment){
		if(_.isEmpty(format)) this.__moment = moment(this);
		else this.__moment = moment(this, format);
	}
	return this.__moment;
}
Date.prototype.moment = Date.prototype.toMoment;

Date.prototype.add = function(number, category){
	this.toMoment().add(number, category);
	return this;
}

Date.prototype.subtract = function(number, category){
	this.toMoment().subtract(number, category);
	return this;
}

Date.prototype.format = function(format){
	format = format || Date.DEFAULT_DATETIME_FORMAT;
	return this.toMoment().format(format);
}
Date.prototype.formatDate = function(){
	return this.format(Date.DEFAULT_DATE_FORMAT);
}

Date.prototype.formatMonth = function(){
	return this.format(Date.DEFAULT_MONTH_FORMAT);
}

Date.prototype.startOf = function(category){
	this.toMoment().startOf(category);
	return this;
}
Date.prototype.startOfDay = function(){
	return this.startOf('day');
}
Date.prototype.startOfMonth = function(){
	return this.startOf('month');
}
Date.prototype.endOf = function(category){
	this.toMoment().endOf(category);
	return this;
}
Date.prototype.endOfDay = function(){
	return this.toMoment().endOf('day')
}
Date.prototype.endOfMonth = function(){
	return this.endOf('month');
}
Date.prototype.isBefore = function(d, category){
	return this.toMoment().isBefore(d, category);
}
Date.prototype.isSame = function(d, category){
	return this.toMoment().isSame(d, category);
}
Date.prototype.isAfter = function(d, category){
	return this.toMoment().isAfter(d, category);
}
Date.prototype.isBetween = function(d1, d2){
	return this.toMoment().isBetween(d1, d2);
}
Date.prototype.isLeapYear = function(){
	return this.toMoment().isLeapYear();
}

Date.prototype.toISOString = function(){
	return this.toMoment().toISOString();
}
Date.prototype.toJSON = function(){
	return this.toISOString();
}

//====================================================Function������չ
Function.emptyFn = function(){};
Function.logFn = function(){console.log(arguments)};

//====================================================underscore������չ
_.mixin({
	isNotEmpty: function(o){
		return !_.isEmpty(o);
	}
});
