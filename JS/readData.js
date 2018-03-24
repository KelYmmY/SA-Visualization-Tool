function dataClass(){
    var mContext = this;
    this.nodes = [];
    this.implicitLinks = [];
    this.explicitLinks = [];
    this.warnArray = [];
    this.appArray = [];

    function filesObj(){
        this.csvFiles = ['../data/domain-explicit-communication-5.csv','../data/domain-implicit-communication-5.csv','../data/domain-permission-enforcement-5.csv','../data/domain-permission-granted-5.csv','../data/domain-permission-usage-5.csv'];
        this.xmlFiles = ['../data/analysisResults-5.xml','../data/app-boostyourjob.boostyourjob.xml','../data/app-br.com.inglessozinho.apphomescreen.xml','../data/app-com.abcdjdj.rootverifier.xml','../data/app-com.adam.aslfms.xml','../data/app-com.android.googlekernel.xml','../data/app-com.appspot.swisscodemonkeys.paintfx.xml','../data/app-com.crossfield.spiderette.xml','../data/app-com.h9kdroid.multicon.xml','../data/app-com.ianhanniballake.contractiontimer.xml','../data/app-com.inficare.UtilityConverter.xml','../data/app-com.keji.danti569.xml','../data/app-com.kpz.pomodorotasks.activity.xml','../data/app-com.madebyappolis.spinrilla.xml','../data/app-com.nayotech.android.shoptraveler.xml','../data/app-com.radio.radioOnline.xml','../data/app-com.rigid.birthdroid.xml','../data/app-com.salimalhajri.Note.xml','../data/app-com.serone.desktoplabel.xml','../data/app-com.skina.takbiir.sadr.moakhira.xml','../data/app-com.sweetlime.cbcollector.xml','../data/app-com.Video.XiaoQiang.xml','../data/app-de.fragenpool.b9.xml','../data/app-de.schaeuffelhut.android.openvpn.xml','../data/app-me.scan.android.client.xml','../data/app-org.bombusmod.xml','../data/app-org.ligi.fast.xml','../data/app-org.sagemath.droid.xml','../data/app-qtool.tools.boulfal.com.qsearchtool.xml','../data/app-soon.giil.blazebourn.xml','../data/app-triv.quiz.song.JOHNNYMATHIS.xml']; 
    }

    //component类初始化 - for nodes
    //component类中的exported属性直接存在appArray里
    function Comp(name, group, type, ifArray){
        this.isApp = false;
        this.name = name;
        this.group = group;
        this.type = type;
        this.intFilter = ifArray;
        this.grantedPermissions = [];
        this.usagePermissions = [];
        this.enforcementPermissions = [];
        this.relatedWarns = [];
    }

    //application类初始化 - for nodes
    function App(name, version, type, usePermArray, actPermArray, reqPermArray, defPermArray){
        this.isApp = true;
        this.name = name;
        this.group = name;
        this.version = version;
        this.type = type;
        this.usesPermissions = usePermArray;
        this.actualPermissions = actPermArray;
        this.requiredPermissions = reqPermArray;
        this.definedPermissions = defPermArray;
    }

    //intentFilter类初始化 - for component
    function IntFilt(id, actArray, catArray, dataArray, dataPath){
        this.id = id;
        this.actions = actArray;
        this.categorys = catArray;
        this.datas = dataArray;
        this.dataPath = dataPath;
    }

    //dataItem类初始化 - for intentFilter
    function DataItm(scheme, mimeType, host){
        this.scheme = scheme;
        this.mimeType = mimeType;
        this.host = host;
    }

    //warning类初始化 - for warnArray
    function Warning(type, attacker, victim, resource){
        this.type = type;
        this.attacker = attacker;
        this.victim = victim;
        this.resource = resource;
    }

    //加载xml文件
    function readXML(url){
        try {       // code for IE7+, Firefox, Chrome, Opera, Safari
            var xmlhttp = new window.XMLHttpRequest();
            xmlhttp.open("GET", url, false);
            xmlhttp.send();
            return xmlhttp.responseXML;
        }
        catch(e){  // code for IE6, IE5
            try{
                var xmldom = new ActiveXObject('Microsoft.XMLDOM');
                xmldom.async = false;
                xmldom.load(url);
                return xmldom;
            }
            catch(e){
                return undefined;
            }
        }
    }

    //处理Xml相关数据
    function reasXMLData(urls){
        var i, k, p, q;

        //处理app-.xml文件
        //初始化构建nodes和appArray数组
        var nodeArray = [];
        var appArray = [];

        for(i = 1; i < urls.length; i++){
            var xml = readXML(urls[i]);
            if(xml){
                //获取application属性
                var appPackName = xml.getElementsByTagName("packageName")[0].childNodes[0].nodeValue;
                var appName = xml.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                var appType = xml.getElementsByTagName("appcategory")[0].childNodes[0].nodeValue;
                //make appName short
                var index = appName.lastIndexOf('.');
                appName = appName.substring(index+1);
                try{
                    var appVersion = xml.getElementsByTagName("versionCode")[0].childNodes[0].nodeValue;
                } catch(e){
                    ;
                }

                //获取application permission属性
                var appPerNode, appPerm;
                //获取usesPermissions属性
                var appUsesPerms = [];
                appPerNode = xml.getElementsByTagName("appUsesPermission");
                for(k = 0; k < appPerNode.length; k++)
                    appUsesPerms.push(appPerNode[k].childNodes[0].nodeValue);
                //获取acualUsesPermissions属性
                var appActPerms = [];
                appPerNode = xml.getElementsByTagName("appActuallyUsesPermission");
                for(k = 0; k < appPerNode.length; k++)
                    appActPerms.push(appPerNode[k].childNodes[0].nodeValue);
                //获取requiredPermissions属性
                var appReqPerms = [];
                appPerNode = xml.getElementsByTagName("appRequiredPermission");
                for(k = 0; k < appPerNode.length; k++)
                    appReqPerms.push(appPerNode[k].childNodes[0].nodeValue)
                //获取definedPermissions属性
                var appDefPerms = [];
                appPerNode = xml.getElementsByTagName("appDefinedPermission");
                for(k = 0; k < appPerNode.length; k++)
                    appDefPerms.push(appPerNode[k].childNodes[0].nodeValue);
                nodeArray[appPackName] = new App(appName, appVersion, appType, appUsesPerms, appActPerms, appReqPerms, appDefPerms);

                //获取component个数
                var compArray = [];
                var compNode = xml.getElementsByTagName("component");
                //获取component属性
                for(k = 0; k < compNode.length; k++) {
                    var compId = compNode[k].getElementsByTagName("dsmIdx")[0].childNodes[0].nodeValue;
                    var compName = compNode[k].getElementsByTagName("compName")[0].childNodes[0].nodeValue;
                    var compType = compNode[k].getElementsByTagName("type")[0].childNodes[0].nodeValue;
                    var compExported = compNode[k].getElementsByTagName("exported")[0].childNodes[0].nodeValue;
                    //make compName short
                    var index = compName.lastIndexOf('.');
                    compName = compName.substring(index+1);
                    var compObj = {id: compId, name: compName, exported: compExported};
                    compArray.push(compObj);

                    //获取intentFilter属性
                    var ifArray = [];
                    var ifNode = compNode[k].getElementsByTagName("intentFilter");
                    for(p = 0; p < ifNode.length; p++){
                        var ifid = ifNode[p].getElementsByTagName("ifID")[0].childNodes[0].nodeValue;
                        //获取action数组
                        var actArray = [];
                        var actNode = ifNode[p].getElementsByTagName("action");
                        for(q = 0; q < actNode.length; q++)
                            actArray.push(actNode[q].childNodes[0].nodeValue);
                        //获取category数组
                        var catArray = [];
                        var catNode = ifNode[p].getElementsByTagName("category");
                        for(q = 0; q < catNode.length; q++)
                            catArray.push(catNode[q].childNodes[0].nodeValue);
                        //获取data数组
                        var dataArray = [];
                        var dataNode = ifNode[p].getElementsByTagName("data_item");
                        for(q = 0; q < dataNode.length; q++){
                            try{
                                var sch = dataNode[q].getElementsByTagName("scheme")[0].childNodes[0].nodeValue;
                                var mim = dataNode[q].getElementsByTagName("mimeType")[0].childNodes[0].nodeValue;
                                var hst = dataNode[q].getElementsByTagName("host")[0].childNodes[0].nodeValue;
                            } catch(e){
                                ;
                            }
                            dataArray.push(new DataItm(sch, mim, hst));
                        }
                        try{
                            var dataPath = ifNode[p].getElementsByTagName("dataPath")[0].childNodes[0].nodeValue;
                        } catch(e) {
                            ;
                        }
                        ifArray.push(new IntFilt(ifid, actArray, catArray, dataArray, dataPath));
                    }
                    nodeArray[compId] = new Comp(compName, appName, compType, ifArray);
                }
                var appObj = {name: appName, packageName: appPackName, compArray: compArray};
                appArray.push(appObj);
            }
            else document.write("cannot read " + urls[i]);
        }


        //处理analy-.xml文件
        //初始化构建warnArray数组
        var warnNo;
        var warnId = 0;
        var wtmpType;
        var wtmpAttacker;
        var wtmpVictim;
        var wtmpResource;
        var warnArray = [];

        xml = readXML(urls[0]);
        if(xml){
            //处理priEsca
            var priEscas = xml.getElementsByTagName("privilegeEscalationInstance");
            warnNo = priEscas.length;
            wtmpType = "Privilege Escalation";
            for(i = 0; i < warnNo; i++){
                wtmpAttacker = priEscas[i].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpVictim = priEscas[i].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpResource = priEscas[i].getElementsByTagName("resource")[0].childNodes[0].nodeValue;
                warnArray[warnId] = new Warning(wtmpType, wtmpAttacker, wtmpVictim, wtmpResource);
                nodeArray[wtmpVictim].relatedWarns.push(warnId);
                nodeArray[wtmpAttacker].relatedWarns.push(warnId);
                warnId++;
            }

            //处理intSpoof
            var intSpoofs = xml.getElementsByTagName("intentSpoofingInstance");
            warnNo = intSpoofs.length;
            wtmpType = "Intent Spoofing";
            for(i = 0; i < warnNo; i++){
                wtmpAttacker = intSpoofs[i].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpVictim = intSpoofs[i].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpResource = intSpoofs[i].getElementsByTagName("potCompDsmIdx")[0].childNodes[0].nodeValue;
                warnArray[warnId] = new Warning(wtmpType, wtmpAttacker, wtmpVictim, wtmpResource);
                nodeArray[wtmpVictim].relatedWarns.push(warnId);
                nodeArray[wtmpAttacker].relatedWarns.push(warnId);
                warnId++;
            }

            //处理unauIntRcpt
            var unauIntRcpts = xml.getElementsByTagName("unauthorizedIntentReceiptInstance");
            warnNo = unauIntRcpts.length;
            wtmpType = "Unauthorized Intent Receipt";
            for(i = 0; i < warnNo; i++){
                wtmpAttacker = unauIntRcpts[i].getElementsByTagName("malCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpVictim = unauIntRcpts[i].getElementsByTagName("vulCompDsmIdx")[0].childNodes[0].nodeValue;
                wtmpResource = unauIntRcpts[i].getElementsByTagName("potCompDsmIdx")[0].childNodes[0].nodeValue;
                warnArray[warnId] = new Warning(wtmpType, wtmpAttacker, wtmpVictim, wtmpResource);
                nodeArray[wtmpVictim].relatedWarns.push(warnId);
                nodeArray[wtmpAttacker].relatedWarns.push(warnId);
                warnId++;
            }
        }
        else document.write("cannot read " + urls[0]);

        mContext.nodes = nodeArray;
        mContext.warnArray = warnArray;
        mContext.appArray = appArray;
    }

    function readCsvFiles(fObject){
        var result = [];
        var files = [];
        fObject.csvFiles.forEach(function(element) {
            if(element.indexOf("implicit")>=0){
                files[0] = element;
            } else if(element.indexOf("explicit")>=0){
                files[1] = element;
            } else if(element.indexOf("granted")>=0){
                files[2] = element;
            } else if(element.indexOf("enforcement")>=0){
                files[3] = element;
            } else if(element.indexOf("usage")>=0){
                files[4] = element;
            }
        });
        result = readCsv(files);
        return result;
    }
    
    function getJsonLength(json){
        var jsonLength=0;
            for (var i in json) {
                jsonLength++;
            }
        return jsonLength;
    }

    async function readCsv(files){ 
        var enforcementPermissions = [];
        var usagePermissions = [];
        var grantedPermissions = [];
        var nodes = [];
        var implicitLinks = [];
        var explicitLinks = [];
        var appArr = [];
        var isReadCompleteArr = [false,false,false,false,false];

        //read implicit file
        d3.csv(files[0], function(error,data){    
            console.log(data);        
            var apps = [];
            for(var i=0; i<data.length;i++){
                var app = data[i].Package;
                if(apps.indexOf(app) < 0 && app!="System"){
                    apps.push(app);
                    var appObj = {name:app, id:app, componentArr:[]};
                    var component = {name:data[i].Component, id:i, exported:false};
                    appObj.componentArr.push(component);
                    appArr.push(appObj);
                } else{
                    var component = {name:data[i].Component, id:i, exported:false};
                    appArr[appArr.length-1].componentArr.push(component);
                }
                var node = {id:data[i].ID, group:app, name:data[i].Component, isApp:false, grantedPermissions:[]
                            , usagePermissions:[], enforcementPermissions:[]};
                if(node.group != "System"){
                    nodes.push(node);
                }
            }
            for(var rowNum=0;rowNum<data.length;rowNum++){
                var app = data[rowNum].Package;
                for(var i=0;i<getJsonLength(data[rowNum])-1;i++){
                    if(data[rowNum][i] == 1 && data[rowNum]["Package"]!="System"){
                        var link={source:rowNum, target:i, value:1};
                        implicitLinks.push(link);
                        for(var j=0; j<apps.length;j++){
                            if(nodes[i].group == apps[j] && app != apps[j] && nodes[i].group!="System" && app!="System"){
                                var link1 = {source:app, target:nodes[i].group, value:4};
                                implicitLinks.push(link1);
                                break;
                            }
                        }
                    }
                }
            }
            for(var i=0;i<nodes.length;i++){
                for(var j=0;j<apps.length;j++){
                    if(nodes[i].group == apps[j]){
                        var link = {source:apps[j], target:i, value:1};
                        implicitLinks.push(link);
                    }
                }
            }
            for(var i=0;i<apps.length;i++){
                var node = {id:apps[i], group:apps[i], name:apps[i], isApp:true};
                nodes.push(node);
            }
            isReadCompleteArr[0] = true;
        });

        //########################################################################################//
        //read explicit files
        d3.csv(files[1], function(error,data){            
            var apps = [];
            var nodesTemp = [];
            for(var i=0; i<data.length;i++){
                var app = data[i].Package;
                if(apps.indexOf(app) < 0 && app!="System"){
                    apps.push(app);
                } 
                var node = {id:data[i].ID, group:app, name:data[i].Component}
                if(node.group != "System"){
                    nodesTemp.push(node);
                }
            }
            for(var rowNum=0;rowNum<data.length;rowNum++){
                var app = data[rowNum].Package;
                for(var i=0;i<getJsonLength(data[rowNum])-1;i++){
                    if(data[rowNum][i] == 1 && data[rowNum]["Package"]!="System"){
                        var link={source:rowNum, target:i, value:1};
                        explicitLinks.push(link);
                        for(var j=0; j<apps.length;j++){
                            if(nodesTemp[i].group == apps[j] && app != apps[j] && nodes[i].group!="System" && app!="System"){
                                var link1 = {source:app, target:nodesTemp[i].group, value:4};
                                explicitLinks.push(link1);
                                break;
                            }
                        }
                    }
                }
            }
            for(var i=0;i<nodesTemp.length;i++){
                for(var j=0;j<apps.length;j++){
                    if(nodesTemp[i].group == apps[j]){
                        var link = {source:apps[j], target:i, value:1};
                        explicitLinks.push(link);
                    }
                }
            }
            isReadCompleteArr[1]=true;
        });

        //===================================================================================================================//
        //read grantedPermission
        Papa.parse("./"+files[2], {
            download:true,
            complete: function(results) {
                var data = results.data;
                console.log(data);
                for(var i=1;i<data.length-2;i++){
                    np = [];
                    for(var j=3;j<data[i].length;j++){
                        if(data[i][j] == 1 && data[i][0] != "System" && data[i].length > 1){
                            np.push(deleteSpace(data[0][j]));
                        }
                    }
                    grantedPermissions.push(np);
                }
                isReadCompleteArr[2]=true;
            }            
        });

        //===============================================================================================================//
        //read enforcement permission
        Papa.parse("./"+files[3], {
            download:true,
            complete: function(results) {
                var data = results.data;
                for(var i=1;i<data.length-2;i++){
                    np = [];
                    for(var j=3;j<data[i].length;j++){
                        if(data[i][j] == 1 && data[i][0] != "System" && data[i].length > 1){
                            np.push(deleteSpace(data[0][j]));
                        }
                    }
                    enforcementPermissions.push(np);
                }
                isReadCompleteArr[3]=true;
            }
        });

        //=================================================================================================================//
        //read used permission
        Papa.parse("./"+files[4], {
            download:true,
            complete: function(results) {
                var data = results.data;
                for(var i=1;i<data.length-2;i++){
                    np = [];
                    for(var j=3;j<data[i].length;j++){
                        if(data[i][j] == 1 && data[i][0] != "System" && data[i].length > 1){
                            np.push(deleteSpace(data[0][j]));
                        }
                    }
                    usagePermissions.push(np);
                }
                isReadCompleteArr[4]=true;
            }
        });

        var isAllReadComplete = false;
        while(!isAllReadComplete){
            await sleep(10);
            isAllReadComplete = true;
            for(var i=0;i<isReadCompleteArr.length;i++){
                if(!isReadCompleteArr[i]){
                    isAllReadComplete = false;
                    break;
                }
            }
        }
        for(var i=0;i<grantedPermissions.length;i++){
            mContext.nodes[i].grantedPermissions = grantedPermissions[i];
            mContext.nodes[i].usagePermissions = usagePermissions[i];
            mContext.nodes[i].enforcementPermissions = enforcementPermissions[i];
        }
        mContext.implicitLinks = implicitLinks;
        mContext.explicitLinks = explicitLinks;
        console.log(mContext.nodes);
        console.log(mContext.warnArray);
        console.log(mContext.appArray);
        console.log(mContext.implicitLinks);
        console.log(mContext.explicitLinks);
        return [];
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function deleteSpace(string){
        var spaceIndex = string.indexOf(" ");
        return string.substring(spaceIndex+1);
    }

    //数组去重复元素
    //在getWarning函数中使用到
    function arrayRemoveRepeat(array) {
        //var array = a.concat(b);
        var res = [];
        for(var i = 0; i < array.length; i ++) {
            var flag = true;
            var temp = array[i];
            for(var j = 0; j < res.length; j ++) {
                if(temp === res[j]) {
                    flag = false;
                    break;
                }
            }
            if(flag) {
                res.push(temp);
            }
        }
        return res;
    }

    this.initiate = function(){
        var fObject = new filesObj();
        reasXMLData(fObject.xmlFiles);
        return readCsvFiles(fObject);
    }


    //只保留输入数组中的componentId
    //在drawTable, showWarnings中使用到
    this.arrayFilter = function(nodeIdArr){
        var res = [];
        for(var i = 0; i < nodeIdArr.length; i++){
            if(!mContext.nodes[nodeIdArr[i]].isApp)
                res.push(nodeIdArr[i])
        }
        return res;
    }


    //在读xml的时候进行初始化
    this.getCategory = function(){
        return mContext.appArray;
    }

    this.getConnectedNodesIdArr = function(nodeId){
        var connectedNodesIdArr = [];
        connectedNodesIdArr.push(nodeId);
        var links = mContext.implicitLinks.concat(mContext.explicitLinks);
        if(mContext.nodes[nodeId].isApp){
            for(var i=0;i<links.length;i++){
                if(links[i].source == nodeId){
                    if(mContext.nodes[links[i].target].isApp && connectedNodesIdArr.indexOf(links[i].target)<0){
                        connectedNodesIdArr.push(links[i].target);
                    }
                } else if(links[i].target == nodeId){
                    if(mContext.nodes[links[i].source].isApp && connectedNodesIdArr.indexOf(links[i].source)<0){
                        connectedNodesIdArr.push(links[i].source);
                    }
                }
            }
        } else{
            for(var i=0;i<links.length;i++){
                if(links[i].source+"" == nodeId){
                    if(connectedNodesIdArr.indexOf(links[i].target+"")<0){
                        connectedNodesIdArr.push(links[i].target+"");
                    }
                } else if(links[i].target+"" == nodeId){
                    if(connectedNodesIdArr.indexOf(links[i].source+"")<0){
                        connectedNodesIdArr.push(links[i].source+"");
                    }
                }
            }
        }
        return connectedNodesIdArr;
    }

    this.getGraphData = function(nodeIdArr){
        var nodesResults = [];
        var implicitLinkResults = [];
        var explicitLinkResults = [];
        for(var i=0;i<nodeIdArr.length;i++){
            var target = nodeIdArr[i];
            var node = {name:mContext.nodes[target].name, id:target, group:mContext.nodes[target].group, type:mContext.nodes[target].type};
            nodesResults.push(node);
        }
        for(var i=0;i<mContext.implicitLinks.length;i++){
            if(nodeIdArr.indexOf(mContext.implicitLinks[i].source+"")>=0 && nodeIdArr.indexOf(mContext.implicitLinks[i].target+"")>=0){
                implicitLinkResults.push(mContext.implicitLinks[i]);
            }
        }

        for(var i=0;i<mContext.explicitLinks.length;i++){
            if(nodeIdArr.indexOf(mContext.explicitLinks[i].source+"")>=0 && nodeIdArr.indexOf(mContext.explicitLinks[i].target+"")>=0){
                explicitLinkResults.push(mContext.explicitLinks[i]);
            }
        }
        result = {nodes:nodesResults, implicitLinks:implicitLinkResults, explicitLinks:explicitLinkResults};
        return result;
    }

    //通过合并每个元素的relatedWarn数组完成
    this.getWarnings = function(nodeIdArr){
        var i;
        var warnIds = [];
        var priEsc = [];
        var intSpf = [];
        var uathInt = [];
        for(i = 0; i < nodeIdArr.length; i++)
            warnIds = warnIds.concat(mContext.nodes[nodeIdArr[i]].relatedWarns);
        warnIds = arrayRemoveRepeat(warnIds);
        for(i = 0; i < warnIds.length; i++){
            var type = mContext.warnArray[warnIds[i]].type;
            var attName = mContext.nodes[mContext.warnArray[warnIds[i]].attacker].name;
            var attGroup = mContext.nodes[mContext.warnArray[warnIds[i]].attacker].group;
            var vicName = mContext.nodes[mContext.warnArray[warnIds[i]].victim].name;
            var vicGroup = mContext.nodes[mContext.warnArray[warnIds[i]].victim].group;
            if(type === "Privilege Escalation"){
                var resName = mContext.warnArray[warnIds[i]].resource;
                var resGroup = "SYSTEM";
                priEsc.push({attName: attName, attGroup: attGroup, vicName: vicName, vicGroup: vicGroup, resName: resName, resGroup: resGroup})
            }
            else{
                var resName = mContext.nodes[mContext.warnArray[warnIds[i]].resource].name;
                var resGroup = mContext.nodes[mContext.warnArray[warnIds[i]].resource].group;
                if(type === "Intent Spoofing")
                    intSpf.push({attName: attName, attGroup: attGroup, vicName: vicName, vicGroup: vicGroup, resName: resName, resGroup: resGroup});
                else uathInt.push({attName: attName, attGroup: attGroup, vicName: vicName, vicGroup: vicGroup, resName: resName, resGroup: resGroup});
            }
        }
        return {priEsc: priEsc, intSpf: intSpf, uathInt: uathInt};
    }

    //当node为component时，nodeId为componentId
    //当node为application时，nodeId为appPackageName
    this.getDetail = function(nodeId){
        var targetNode = mContext.nodes[nodeId];
        var data = [];
        if(targetNode.isApp)
            data = {name: targetNode.name, version: targetNode.version, category: targetNode.type};
        else data = {name: targetNode.name, app: targetNode.group, type: targetNode.type, intentFilter: targetNode.intFilter};
        return {isApp:targetNode.isApp, data:data};
    }


    //当node为component时，nodeId为componentId
    //当node为application时，nodeId为appPackageName
    this.getDomain = function(nodeId){
        var targetNode = mContext.nodes[nodeId];
        var data = [];
        if(targetNode.isApp)
            data = {usesPermissions:targetNode.usesPermissions, actualUsesPermissions:targetNode.actualPermissions,
                requiredPermissions:targetNode.requiredPermissions, definedPermissions:targetNode.definedPermissions};
        else data = {grantedPermissions:targetNode.grantedPermissions, usagePermissions:targetNode.usagePermissions,
                enforcementPermissions:targetNode.enforcementPermissions};
        return {isApp:targetNode.isApp, data:data};
    }

    //输入nodeIdArr为component id数组
    this.getTable = function(nodeIdArr){
        nodesResults = [];
        implicitLinkResults = [];
        explicitLinkResults = [];
        console.log(nodeIdArr);
        for(var i = 0;i < nodeIdArr.length; i++){
            var targetNode = mContext.nodes[nodeIdArr[i]];
            var objNode = {name:targetNode.name, id:nodeIdArr[i], group:targetNode.group};
            nodesResults.push(objNode);
        }
        for(var i=0;i<mContext.implicitLinks.length;i++){
            if(nodeIdArr.indexOf(mContext.implicitLinks[i].source)>=0 && nodeIdArr.indexOf(mContext.implicitLinks[i].target)>=0){
                implicitLinkResults.push(mContext.implicitLinks[i]);
            }
        }
        for(var i=0;i<mContext.explicitLinks.length;i++){
            if(nodeIdArr.indexOf(mContext.explicitLinks[i].source)>=0 && nodeIdArr.indexOf(mContext.explicitLinks[i].target)>=0){
                explicitLinkResults.push(mContext.explicitLinks[i]);
            }
        }
        var implicitTable = [];
        for(var i=0;i<nodesResults.length;i++){
            var row = [];
            for(var j=0;j<nodesResults.length;j++){
                row[j] = 0;
            }
            implicitTable.push(row);
        }
        for(var i=0;i<implicitLinkResults.length;i++){
            implicitTable[nodeIdArr.indexOf(implicitLinkResults[i].source)][nodeIdArr.indexOf(implicitLinkResults[i].target)] = 1;
        }

        var explicitTable = [];
        for(var i=0;i<nodesResults.length;i++){
            var row = [];
            for(var j=0;j<nodesResults.length;j++){
                row[j] = 0;
            }
            explicitTable.push(row);
        }
        for(var i=0;i<explicitLinkResults.length;i++){
            explicitTable[nodeIdArr.indexOf(explicitLinkResults[i].source)][nodeIdArr.indexOf(explicitLinkResults[i].target)] = 1;
        }
        return {implicitTable:implicitTable, explicitTable:explicitTable, nodes:nodesResults};
    }
}
Window.dataClass = dataClass;   