/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();

    //TODO: code formating if else statment
    //TODO: add constans here with inline comment - DONE
    //TODO:remove this -- completed
    //var refreshInterval;
    //var providerData;

    /*
    * constants
    * */
    var CHART_CONF = 'chart-conf';
    var PROVIDER_CONF = 'provider-conf';
    var REFRESH_INTERVAL = 'refreshInterval';
    var TABLE_NAME = "tableName";
    var PROVIDER_NAME = "provider-name";
    var CONTENT_TYPE = "application/json";
    var TYPE = { OPERATOR:"operator", SP:"sp", APP:"app" }; //TODO:CHECK THIS
    var STREAMS = { RESPONSE_TIME_SUMMERY_DAY:"ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_REPONSETIME_SUMMARY_PER_DAY",
                    RESPONSE_TIME_SUMMERY:"ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_REPONSETIME_SUMMARY_PER_",
                    OPERATOR_SUMMERY:"ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_OPERATOR_SUMMARY",
                    API_SUMMERY:"ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY"
                  };
    var METHOD = {GET:"GET", POST:"POST"};


    var operatorName = "all", serviceProviderId = 0, apiId = 0, applicationId = 0;
    //var role;
    var loggedInUser;
    var selectedOperator;
    var operatorSelected = false;
    //var spLogged = false;

    var init = function () {
        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: METHOD.GET,
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                conf = JSON.parse(data);
                //TODO:optimize this code. remove this logic
                if(operatorSelected) {
                    conf.operatorName =  selectedOperator;
                } else {
                    conf.operatorName =  operatorName;
                }
                conf.serviceProvider = serviceProviderId;
                conf.api = apiId;
                conf.applicationName = applicationId;
    //TODO: this can be moved into common js - moment and format as a function
                conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
                conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.RESPONSE_TIME_SUMMERY_DAY;

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        schema = data;
                    }
                });
            }
        });
    };

    //====================================remove this==========================================
    //MOVE THIS TO USER.OPERATOR
    /*var getOperatorNameInProfile = function () {
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getProfileOperator',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                operatorName = data.operatorName;
            }
        });
    };


    //TODO:change this function to getUser.
    //user: {
    //  isoperator, issp, iscustomerCareUser:  // this user obj should return from common.js file. load that file in begining
       // role:
        //operatorName:
    // }
    var getRole = function () {
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getRole',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                role = data.role;
                //move operadmin hard coded values to json file in commons packages.
                //user.roles.contains(operator-admin role) - this value comes from json.
                //user.isadmin == this value can be true/false;
                if("operatoradmin" == role) {
                    $("#operatordd").hide();
                    conf.operatorName = operatorName;
                } else if ("serviceProvider" == role) {
                    spLogged = true; // TOdo - move this logic to common.js function
                    $("#serviceProviderdd").hide();
                }
            }
        });
    };*/

 //==============================================================================================================

    var getLoggedInUser = function () {
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getLoggedInUser',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                loggedInUser = data;
                operatorName = loggedInUser.operatorNameInProfile;
                //role = data.role;
                //move operadmin hard coded values to json file in commons packages.
                //user.roles.contains(operator-admin role) - this value comes from json.
                //user.isadmin == this value can be true/false;
                if(loggedInUser.isOperatorAdmin) {
                    $("#operatordd").hide();
                    conf.operatorName = operatorName;
                } else if (loggedInUser.isServiceProvider) {
                    //spLogged = true; //                        TOdo - move this logic to common.js function
                    $("#serviceProviderdd").hide();
                }
            }
        });
    };

    var getProviderData = function () {
        conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.RESPONSE_TIME_SUMMERY;

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                providerData = data;
            }
        });

        return providerData;
    };


    var drawGadget = function (providerData) {
        draw('#canvas', conf[CHART_CONF], schema, providerData);
        setInterval(function() {
            draw('#canvas', conf[CHART_CONF], schema, providerData);
        },pref.getInt(REFRESH_INTERVAL));
    };


    $("#button-search").click(function() {
        $("#canvas").html("");
        $("#canvas2").html("");
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            init();
            //TODO: remove this function call
            //getProviderData();
            drawGadget(getProviderData());
        });
    });

    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        //getRole();
        //loadOperator();
        getLoggedInUser();
        //TODO:maintain tableName, prodvidr-name, as constants - DONE
        function loadOperator (){
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.OPERATOR_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;
            conf.operatorName = "all"; // TODO:check and remove. all value set in init function
            operatorName = "all"; // TODO:do as above
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    $("#dropdown-operator").empty();
                    var operatorsItems = "";
                    var operatorNames = [];
                    var loadedOperator = [];
                    operatorNames.push(operatorName);
                    operatorsItems += '<li><a data-val="all" href="#">All</a></li>';
                    for (var i =0 ; i < data.length; i++) {
                        var operator = data[i];
                        if($.inArray(operator.operatorName, loadedOperator)<0){
                            operatorsItems += '<li><a data-val='+ operator.operatorName +' href="#">' + operator.operatorName +'</a></li>';
                            operatorNames.push(" "+operator.operatorName);
                            loadedOperator.push(operator.operatorName);
                        }
                    }
                    $("#dropdown-operator").html( $("#dropdown-operator").html() + operatorsItems);
                    $("#button-operator").val('<li><a data-val="all" href="#">All</a></li>');
                    if(loggedInUser.isOperatorAdmin) { //TODO: should be user.isadmin == true
                        //getOperatorNameInProfile();
                        loadSP(loggedInUser.operatorNameInProfile); // TODO:reomve getOperatorNameInProfile pass user.opertorName as param to this func
                    } else {
                        loadSP(operatorNames);
                    }

                    $("#dropdown-operator li a").click(function(){
                        $("#button-operator").text($(this).text());
                        $("#button-operator").append('<span class="caret"></span>');
                        $("#button-operator").val($(this).text());
                        operatorNames = $(this).data('val');
                        loadSP(operatorNames);
                        operatorSelected = true;
                    });
                }
            });
        }

        function loadSP (clickedOperator) {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;
            conf.operatorName =  "("+clickedOperator+")"; //TODO: reomve this brackets from clicked operator. add brackets at service level
            selectedOperator = conf.operatorName;
            serviceProviderId = 0;

            if (loggedInUser.isServiceProvider) { //user.issp == true
                $.ajax({
                    //TODO:change ajax call name to getLoggedInUser
                    url: gadgetLocation + '/gadget-controller.jag?action=getSp',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        loadApp(data.serviceProvider, selectedOperator);
                    }
                });
            } else {
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        $("#dropdown-sp").empty();
                        var spItems = '';
                        var spIds = [];
                        var loadedSps = [];
                        spIds.push(serviceProviderId);
                        spItems += '<li><a data-val="0" href="#">All</a></li>';
                        for ( var i =0 ; i < data.length; i++) {
                            var sp = data[i];
                            if($.inArray(sp.serviceProviderId, loadedSps)<0){
                                spItems += '<li><a data-val='+ sp.serviceProviderId +' href="#">' + sp.serviceProvider.replace("@carbon.super","") +'</a></li>'
                                spIds.push(" "+sp.serviceProviderId);
                                loadedSps.push(sp.serviceProviderId);
                            }
                        }
                        $("#dropdown-sp").html(spItems);

                        $("#button-sp").text('All');
                        $("#button-sp").val('<li><a data-val="0" href="#">All</a></li>');
                        loadApp(spIds,selectedOperator);
                        $("#dropdown-sp li a").click(function(){

                            $("#button-sp").text($(this).text());
                            $("#button-sp").append('<span class="caret"></span>');
                            $("#button-sp").val($(this).text());
                            // var clickedSP = [];
                            // clickedSP.push($(this).data('val'));
                            spIds = $(this).data('val');
                            serviceProviderId = spIds;
                            loadApp(spIds,selectedOperator);
                        });
                    }
                });
            }
        }

        function loadApp (sps,clickedOperator) {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.SP;
            applicationId = 0;
            conf.serviceProvider = "("+sps+")";
            conf.operatorName = "("+clickedOperator+")"; //TODO: check this brackets.
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {

                    $("#dropdown-app").empty();
                    var apps = [];
                    var loadedApps = [];
                    var appItems = '<li><a data-val="0" href="#">All</a></li>';
                    for ( var i =0 ; i < data.length; i++) {
                        var app = data[i];
                        if($.inArray(app.applicationId, loadedApps)<0){
                            appItems += '<li><a data-val='+ app.applicationId +' href="#">' + app.applicationName +'</a></li>'
                            apps.push(" "+app.applicationId);
                            loadedApps.push(app.applicationId);
                        }
                    }

                    $("#dropdown-app").html( $("#dropdown-app").html() + appItems);
                    $("#button-app").val('<li><a data-val="0" href="#">All</a></li>');
                    $("#button-app").text('All');
                    // loadApp(sps[i]);

                    loadApi(apps);

                    $("#dropdown-app li a").click(function(){

                        $("#button-app").text($(this).text());
                        $("#button-app").append('<span class="caret"></span>');
                        $("#button-app").val($(this).text());
                        // var clickedSP = [];
                        // clickedSP.push($(this).data('val'));
                        apps = $(this).data('val');
                        applicationId = apps;
                        loadApi(apps);
                    });

                }
            });
        }

        //TODO: move table names as constants
        function loadApi (apps){
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.APP;
            conf.applicationId = "("+apps+")";
            apiId = 0;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    $("#dropdown-api").empty();
                    var apis = [];
                    var loadedApis = [];
                    var apiItems = '<li><a data-val="0" href="#">All</a></li>';
                    for ( var i =0 ; i < data.length; i++) {
                        var api = data[i];
                        if($.inArray(api.apiID, loadedApis)<0){
                            apiItems += '<li><a data-val='+ api.apiID +' href="#">' + api.api +'</a></li>';
                            loadedApis.push(api.apiID);
                        }
                    }

                    $("#dropdown-api").html( $("#dropdown-api").html() + apiItems);
                    $("#button-api").val('<li><a data-val="0" href="#">All</a></li>');
                    $("#button-api").text('All');
                    // loadApp(sps[i]);
                    $("#dropdown-api li a").click(function(){
                        $("#button-api").text($(this).text());
                        $("#button-api").append('<span class="caret"></span>');
                        $("#button-api").val($(this).text());
                        apiId = $(this).data('val');
                    });

                }
            });
        }

        $("#button-app").val("All");
        $("#button-api").val("All");
        $("#button-type").val("Response Time");

        $('input[name="daterange"]').daterangepicker({
            timePicker: true,
            timePickerIncrement: 30,
            locale: {
                format: 'MM/DD/YYYY h:mm A'
            }
        });
    });

    $("#dropdown-type li a").click(function(){
        $("#button-type").text($(this).text());
        $("#button-type").append('<span class="caret"></span>');
        $("#button-type").val($(this).text());
    });
});
