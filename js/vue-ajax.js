
//import cacheUtil from './util/cacheUtils.js'
//import config from '../config.js'
var head='http';
var realm = '192.168.1.102';
var port = 8052;
var havePort=true;
var loginSaveTime=1000*10*30;

var isLogin = false;

function setStore(name, content){
	if (!name) return;
	if (typeof content !== 'string') {
		content = JSON.stringify(content);
	}
	window.localStorage.setItem(name, content);
}

/**
 * 获取localStorage
 */
function getStore(name){
	if (!name) return;
	var d = window.localStorage.getItem(name);
	return d;
}
function addData(obj){
	var target = getStore("user");
 	if(target!='undefined' && target!=null){
 		target = JSON.parse(target);
 		if(target.id!='undefined' && target.id != null){
			obj.target = target.id;	
 		}
 	}
 	return obj;
}
//添加url传送信息
function addUrl (url,obj){
    //如果省略url，则为post请求，令obj为url，令url为null
    if(arguments.length==1){
        obj=url;
        url=null;
    }
    
    addData(obj);
    //url不为空(get请求: 设置url信息)
    if(!!url){
    	var url = getHead()+url;
        for(var k in obj){
            url += (url.indexOf("?")==-1 ? "?" : "&");
            url+=encodeURIComponent(k)+ "=" +encodeURIComponent(obj[k]);
        }
        
    }else{
        //post请求(设置data信息)
        url="";
        for(var k in obj){
            url+=encodeURIComponent(k)+ "=" +encodeURIComponent(obj[k]);
            url+="&";
        }
        //删除最后一个&
        var arr=url.split("");
        arr.pop();
        url=arr.join("");
    }
    return url;
}
function get(url,data,fn,ojson){
    var xhr=getHttpObj();
    //省略data时,即不发送数据
    if(typeof data =="function"){
        ojson=fn;
        fn=data;
        data={};
    }
    //合并url和data信息
    var u=addUrl(url,data)
    //是否异步发送
    xhr.open("get",u,true);
    xhr.send(null);
    //当请求完成之后调用回调函数返回数据
    success(fn,ojson,xhr);
    //链式编程
    return this;
}
function post(url,data,fn,ojson){
	//发生请求调用
	login();
    var xhr=getHttpObj();
    //省略data时,即不发送数据
    if(typeof data =="function"){
        ojson=fn;
        fn=data;
        data={};
    }
    //合并data信息
    data=addUrl(data);
    //是否异步发送
    var u = getHead()+url;
    xhr.open("post",u,true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);

    //当请求完成之后调用回调函数返回数据
    success(fn,ojson,xhr);
    //链式编程
    return this;
}
    //字符串转换json
function json(str){
    return (new Function("return " + str))(); 
}
function success(fn,ojson,xhr){
    //当请求完成之后调用回调函数返回数据
	xhr.onreadystatechange=function (){
        var odata = null;
        if(xhr.readyState == 4){
            if((xhr.status>=200 && xhr.status<300) || xhr.status == 304){
                odata=xhr.responseText;
                //若为json则转化json格式
                if(ojson==="json"){
                    odata=JSON.parse(odata);
                }
                fn(odata);
            }else{
                odata="request was unsuccessful:"+xhr.status;
                fn(odata);
            }
        }
    }
    
}
//取消异步请求
function cancel(xhr){
    xhr.abort();
    return this;
}
function getHead(){
	if(havePort){
		return head+'://'+realm+":"+port+"/"
	}else{
		return head+'://'+realm+"/"
	}
}
function getHttpObj(){  
    var httpobj = null;  
    try {  
        httpobj = new ActiveXObject("Msxml2.XMLHTTP");  
    }  
    catch (e) {  
        try {  
            httpobj = new ActiveXObject("Microsoft.XMLHTTP");  
        }  
        catch (e1) {  
            httpobj = new XMLHttpRequest();  
        }  
    }  
    return httpobj;  
}
function login(){
	var isLogin = loginInfo();
	if(!isLogin){
		console.log("未登录，发起登录请求！")
		get("login",function (data){
	        console.log(data);
	        setStore("user",data.data);
	        var loginTime = new Date().valueOf();
	        setStore("loginTime",loginTime);
	    },"json");
	}
}

function loginInfo(){
	var loginTime = getStore("loginTime");
	if(loginTime==null) return false;
	var t = new Date().valueOf() - loginTime;
	if(!t){
		return false;
	}
	if(t>loginSaveTime){
		return false;
	}else
		return true;
	
}
