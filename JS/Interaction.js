function interaction(){
    var obj = new Window.dataClass();
    var mContext = this;
    //初始化dataClass
    this.initiate = async function(){
        return await obj.initiate();
    }

    // draw table
    function table(nodes, link, rowspan){

        // draw the head of the table
        var html = '<tr><th></th><th></th><th>ID</th>';
        for(var i=0; i < nodes.length; i++){
            html += '<th>' + nodes[i].id + '</th>';
        }
        html += '</tr>';

        // draw the body of the table
        var rsIndex = 0;
        var rsCnt = rowspan[rsIndex];
        for(var i = 0; i < link.length; i++){
            if(rsCnt === 0){
                rsIndex += 1;
                rsCnt = rowspan[rsIndex];
            }
            html += '<tr>';
            if(rsCnt === rowspan[rsIndex]){
                html += '<td rowspan = ' + rowspan[rsIndex] + '>' + nodes[i].group + '</td>';
            }
            html += '<td>' + nodes[i].name + '</td><td>' + nodes[i].id + '</td>';
            for(var j = 0; j < link[i].length; j++){
                html += '<td>' + link[i][j] + '</td>';
            }
            html += '</tr>';
            rsCnt -= 1;
        }
        return html
    }

    // update checktree
    function updateCheckT(nodeIdArr){

        // remove previous checked class
        var eles = $('#show_tree .checkbox').filter('.checked');
        for(var i = 0; i < eles.length; i++){
            $(eles[i]).removeClass('checked');
        }

        var eles = $('#show_tree .checkbox').filter('.half_checked');
        for(var i = 0; i < eles.length; i++){
            $(eles[i]).removeClass('half_checked');
        }

        // add checked class
        var parents = [];
        for(var i = 0; i < nodeIdArr.length; i++){
            // var li = $('#show_tree').find('#' + nodeIdArr[i]);
            var li = $('li[id="' + nodeIdArr[i] + '"]');
            $(li).find('.checkbox').addClass('checked');

            // add the id of the father node into parents list
            if(jQuery.inArray($(li).parents('li').attr('id'), parents) === -1){
                parents.push($(li).parents('li').attr('id'))
            }
        }

        // update parent node
        for(i = 0; i < parents.length -1; i++){
            // all the child node of the parent
            var cntall = $('li[id="' + parents[i] + '"]').find('li').length;

            // the number of checked children nodes
            var cntcheck = $('li[id="' + parents[i] + '"]').find('.checkbox').filter('.checked').length;

            console.log('cntall ', cntall);
            console.log('cntcheck ', cntcheck);

            if(cntall === cntcheck){
                $('li[id="' + parents[i] + '"]').children('.checkbox').addClass('checked');
            }
            else{
                $('li[id="' + parents[i] + '"]').children('.checkbox').addClass('half_checked');
            }
        }
    };


    // application tree display
    this.drawAll = function(){
        var apps = obj.getCategory();
        var data = [];
        var html = '';
        for(var i = 0; i < apps.length; i++){
            data[i] = {name: apps[i].name, packageName: apps[i].packageName, children: []};
            html += '<li id = "' + data[i].packageName + '"><input type = "checkbox"><label>' + data[i].name + '</label><ul>';
            for(var j = 0; j < apps[i].compArray.length; j++){
                data[i].children[j] = {name: apps[i].compArray[j].name, id: apps[i].compArray[j].id, exported: apps[i].compArray[j].exported};
                html += '<li id = "' +  data[i].children[j].id + '"><input type = "checkbox"><label>' + data[i].children[j].name;
                if(data[i].children[j].exported === 'T'){
                    html += '<span class="glyphicon glyphicon-lock" aria-hidden="true"></span>';
                }
                html += '</label></li>';
            }
            html += '</ul></li>';
        }
        $('ul.tree').html(html);
        $('ul.tree').checkTree();
    };


    this.drawGraph = function(nodeIdArrs){
        mContext.showWarning(nodeIdArrs);
        var radius = 6;
        var width = 779;
        var height = 305;
        
        var svg = d3.select("body").select("div.content").select("div.main").select("div.border").select("div.show_area").select("div.Dgraph").select("div.Dgraph_show").select("svg");
        svg.remove();
        svg = d3.select("body").select("div.content").select("div.main").select("div.border").select("div.show_area").select("div.Dgraph").select("div.Dgraph_show").append("svg").attr("width",width).attr("height",height),
                width = +svg.attr("width"),
                height = +svg.attr("height");

        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width/2, height/2));
        var data = obj.getGraphData(nodeIdArrs);
        var nodes = [];
        var dataNd = data.nodes;
        var explicitLinks = [];
        var implicitLinks = [];
        var dataIm = data.implicitLinks;
        var dataEx = data.explicitLinks;
        for(var i=0;i<dataIm.length;i++){
            implicitLinks.push({source:dataIm[i].source, target:dataIm[i].target, value:dataIm[i].value});
        }
        for(var i=0;i<dataEx.length;i++){
            explicitLinks.push({source:dataEx[i].source, target:dataEx[i].target, value:dataEx[i].value});
        }
        for(var i=0;i<dataNd.length;i++){
            nodes.push({name:dataNd[i].name, group:dataNd[i].group, id:dataNd[i].id, type:dataNd[i].type});
        }
        var links = [];
        for(var i=0;i<implicitLinks.length;i++){
            implicitLinks[i].group=0;
            links.push(implicitLinks[i]);
        }
        for(var i=0;i<explicitLinks.length;i++){
            var hasLink = false;
            var index = -1;
            for(var j=0;j<implicitLinks.length;j++){
                if(implicitLinks[j].target == explicitLinks[i].target && implicitLinks[j].source == explicitLinks[i].source){
                    links[i].group = 2;
                    hasLink = true;
                    index = j;
                    break;
                }
            }
            if(hasLink){
                links[index].group = 2;
            } else{
                explicitLinks[i].group=1;
                links.push(explicitLinks[i]);
            }
        }

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
            .style("stroke", function(d) { if(d.group==0){
                return "yellow";
            } else if(d.group==1){
                return "blue";
            } else{
                return "black";
            }});


        var node = svg.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", function (d) {
                if(d.name == d.group){
                    return "app node";
                } else if (d.type === "activity") {
                    return "activity node";
                } else if(d.type == "service"){
                    return "service node";
                } else if(d.type == "provider"){
                    return "provider node";
                } else{
                    return "receiver node";
                }
            })
            .attr("fill", function(d) { return color(d.group); })
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
            .on("click", function(d){
                nodeClick(d);
            });

        d3.selectAll(".provider").append("rect")
            .attr("width", 8)
            .attr("height", 8)
            .attr("class", function (d) {
                return "node type" + 0;
            })
            .on("click", function(d){
                nodeClick(d);
            });

        d3.selectAll(".activity").append("circle")
            .attr("r", radius/1.5)
            .attr("class", function (d) {
                return "node type" + 1;
            })
            .on("click", function(d){
                nodeClick(d);
            });

        d3.selectAll(".app").append("circle")
            .attr("r", radius)
            .attr("class", function (d) {
                return "node type" + 2;
            })
            .on("click", function(d){
                nodeClick(d);
            });

        d3.selectAll(".service").append("polygon")
            .style("stroke", "none")
            .attr("points", "0,0, 10,0, 5,8")
            .attr("class", function (d) {
                return "node type" + 3;
            })
            .on("click", function(d){
                nodeClick(d);
            });

         d3.selectAll(".receiver").append("polygon")
            .style("stroke", "none")
            .attr("points", "0,-5, 4.7,-1.72, 3.1,3.88, -2.8,4.08, -4.8,-1.44")
            .attr("class", function (d) {
                return "node type" + 4;
            })
            .on("click", function(d){
                nodeClick(d);
            });

        node.append("title")
            .text(function(d) { return d.name; });

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

        function nodeClick(targetNode){
            var requiredNodeIdArr = obj.getConnectedNodesIdArr(targetNode.id);
            mContext.showDetail(targetNode.id);
            mContext.showDomain(targetNode.id);
            mContext.drawGraph(requiredNodeIdArr);
            mContext.drawTable(requiredNodeIdArr);
            updateCheckT(requiredNodeIdArr);
        }

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function (d) {
                return "translate(" + Math.max(radius, Math.min(width - radius, d.x)) + "," + Math.max(radius, Math.min(height - radius, d.y)) + ")";
            });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        //$('.Dgraph.graph').html(svg);
    };

    this.drawTable = function(nodeIdArrs){
        var nodeIdArr = [];
        for(var i=0;i<nodeIdArrs.length;i++){
            if(isNaN(parseInt(nodeIdArrs[i]))){
                nodeIdArr.push(nodeIdArrs[i]);
            } else{
                nodeIdArr.push(parseInt(nodeIdArrs[i]));
            }
        }
        var nodeIdArrInput = obj.arrayFilter(nodeIdArr);
        nodeIdArrInput.sort(function(a,b){return a-b;});
        res = obj.getTable(nodeIdArrInput);
        console.log(nodeIdArrInput)
        console.log(res)
        if(res.nodes.length === 0){
            $('.Etable').css('display', 'none');
            $('.Itable').css('display', 'none');
            return
        }
        else{
            $('.Etable').show();
            $('.Itable').show();
        }

        // $('.Etable').css('display', 'none');
        // $('.Itable').css('display', 'none');

        // record the rowSpan attribute used in the table
        var rowspan = [];
        var parent = res.nodes[0].group;
        var count = 0;
        for(var i = 0; i < res.nodes.length; i++){
            if(parent === res.nodes[i].group){
                count += 1;
            }
            else{
                rowspan.push(count);
                parent = res.nodes[i].group;
                count = 1;
            }
        }
        rowspan.push(count);

        // draw the explicit table
        var ehtml = table(res.nodes, res.explicitTable, rowspan);
        $('.Etable .table').html(ehtml);

        // draw the implicit table
        var ihtml = table(res.nodes, res.implicitTable, rowspan);
        $('.Itable .table').html(ihtml);

    };

    // information display
    this.showDetail = function(nodeId){
        var id;
        id = nodeId+"";
        if(!isNaN(parseInt(nodeId))){
            id = parseInt(nodeId);
        }
        var node = obj.getDetail(id);
        // console.log(node);
        var html = '';

        if(node.isApp){
            var data = node.data;
            html += '<ul class = "info">';
            html += '<li><label>' + 'Name: ' + data.name + '</label></li>';
            html += '<li><label>' + 'Version: ' + data.version + '</label></li>';
            html += '<li><label>' + 'Category: ' + data.category + '</label></li>';
            html += '</ul>';
        }
        else{
            var data = node.data;
            html += '<ul class = "info">';
            html += '<li><label>' + 'Name: ' + data.name + '</label></li>';
            html += '<li><label>' + 'Application: ' + data.app + '</label></li>';
            html += '<li><label>' + 'Type: ' + data.type + '</label></li>';
            var inf = data.intentFilter;
            if(inf.length){
                html += '<li><label>' + 'Intent Filter' + '</label><ul>';
                for(var i = 0; i < inf.length; i++){
                    html += '<li><label>' + 'Intent Filter Id: ' + inf[i].id + '</label><ul>';
                    if(inf[i].actions.length){
                        html += '<li><label>' + 'Action' + '</label><ul>';
                        for(var j = 0; j < inf[i].actions.length; j++)
                            html += '<li><label>' + inf[i].actions[j] + '</label></li>';
                    }
                    if(inf[i].categorys.length){
                        html += '</ul></li><li><label>' + 'Category' + '</label><ul>';
                        for(var j = 0; j < inf[i].categorys.length; j++)
                            html += '<li><label>' + inf[i].categorys[j] + '</label></li>';
                    }
                    if(inf[i].datas.length){
                        html += '</ul></li><li><label>' + 'Data' + '</label><ul>';
                        for(var j = 0; j < inf[i].datas.length; j++)
                            html += '<li><label>' + inf[i].datas[j] + '</label></li>';
                    }
                    if(inf[i].dataPath)
                        html += '</ul></li><li><label>' + 'Data Path: ' + inf[i].dataPath + '</label></li>';
                    html += '</ul></li>';
                }
                html += '</ul></li>';
            }
            html += '</ul>';
        }
        $('.info_panel ul.mtree').html(html);
        $('.info_panel ul.mtree').checkTree();
    };

    // permission domain display
    this.showDomain = function(nodeId){
        var node = obj.getDomain(nodeId);
        var html = '';
        var i;

        if(node.isApp){
            html += '<ul>';
            //get usePermissions
            var usePermData = node.data.usesPermissions;
            if(usePermData.length){
                html += '<li><label>' + 'Uses Permission' + '</label><ul>';
                for(i = 0; i < usePermData.length; i++)
                    html += '<li><label>' + usePermData[i] + '</label></li>';
                html += '</ul></li>';
            }
            //get actualUsesPermissions
            var actPermData = node.data.actualUsesPermissions;
            if(actPermData.length){
                html += '<li><label>' + 'Actually Uses Permission' + '</label><ul>';
                for(i = 0; i < actPermData.length; i++)
                    html += '<li><label>' + actPermData[i] + '</label></li>';
                html += '</ul></li>';
            }
            //get requiredPermissions
            var reqPermData = node.data.requiredPermissions;
            if(reqPermData.length){
                html += '<li><label>' + 'Required Permission' + '</label><ul>';
                for(i = 0; i < reqPermData.length; i++)
                    html += '<li><label>' + reqPermData[i] + '</label></li>';
                html += '</ul></li>';
            }
            //get definedPermissions
            var defPermData = node.data.definedPermissions;
            if(defPermData.length){
                html += '<li><label>' + 'Defined Permission' + '</label><ul>';
                for(i = 0; i < defPermData.length; i++)
                    html += '<li><label>' + defPermData[i] + '</label></li>';
                html += '</ul></li>';
            }
        }
        else{
            html += '<ul>';
            //get grantedPermissions
            var graPermData = node.data.grantedPermissions;
            if(graPermData.length){
                html += '<li><label>' + 'Granted Permission' + '</label><ul>';
                for(i = 0; i < graPermData.length; i++)
                    html += '<li><label>' + graPermData[i] + '</label></li>';
                html += '</ul></li>';
            }
            //get usagePermissions
            var usagePermData = node.data.usagePermissions;
            if(usagePermData.length){
                html += '<li><label>' + 'Usage Permission' + '</label><ul>';
                for(i = 0; i < usagePermData.length; i++)
                    html += '<li><label>' + usagePermData[i] + '</label></li>';
                html += '</ul></li>';
            }
            //get enforcementPermissions
            var enfPermData = node.data.enforcementPermissions;
            if(enfPermData.length){
                html += '<li><label>' + 'Enforcement Permission' + '</label><ul>';
                for(i = 0; i < enfPermData.length; i++)
                    html += '<li><label>' + enfPermData[i] + '</label></li>';
                html += '</ul></li>';
            }
        }
        $('.domain-panel ul.mtree').html(html);
        $('.domain-panel ul.mtree').checkTree();
    };

    this.showWarning = function(nodeIdArrs){
        var temp = [];
        for(var i=0;i<nodeIdArrs.length;i++){
            if(isNaN(parseInt(nodeIdArrs[i]))){
                temp.push(nodeIdArrs[i]);
            } else{
                temp.push(parseInt(nodeIdArrs[i]));
            }
        }
        var nodeIdArr = obj.arrayFilter(temp);
        var warns = obj.getWarnings(nodeIdArr);
        var html = '<ul>';
        //console.log(warns);

        //显示Privilege Escalation
        html += '<li><label>' + 'Privilege Escalation ( ' + warns.priEsc.length + ' )' + '</label><ul>';
        for(var i = 0; i < warns.priEsc.length; i++){
            html += '<li><label>' + 'Attacker: ' + warns.priEsc[i].attName + ' ( ' + warns.priEsc[i].attGroup + ' ); </label>';
            html += '<label>' + 'Victim: ' + warns.priEsc[i].vicName + ' ( ' + warns.priEsc[i].vicGroup + ' ); </label>';
            html += '<label>' + 'Resource: ' + warns.priEsc[i].resName + ' ( ' + warns.priEsc[i].resGroup + ' ) </label></li>';
        }
        html += '</ul></li>';

        //显示Intent Spoofing
        html += '<li><label>' + 'Intent Spoofing ( ' + warns.intSpf.length + ' )' + '</label><ul>';
        for(var i = 0; i < warns.intSpf.length; i++){
            html += '<li><label>' + 'Attacker: ' + warns.intSpf[i].attName + ' ( ' + warns.intSpf[i].attGroup + ' ); </label>';
            html += '<label>' + 'Victim: ' + warns.intSpf[i].vicName + ' ( ' + warns.intSpf[i].vicGroup + ' ); </label>';
            html += '<label>' + 'Pot: ' + warns.intSpf[i].resName + ' ( ' + warns.intSpf[i].resGroup + ' ) </label></li>';
        }
        html += '</ul></li>';

        //显示Unauthorized Intent Receipt
        html += '<li><label>' + 'Unauthorized Intent Receipt ( ' + warns.uathInt.length + ' )' + '</label><ul>';
        for(var i = 0; i < warns.uathInt.length; i++){
            html += '<li><label>' + 'Attacker: ' + warns.uathInt[i].attName + ' ( ' + warns.uathInt[i].attGroup + ' ); </label>';
            html += '<label>' + 'Victim: ' + warns.uathInt[i].vicName + ' ( ' + warns.uathInt[i].vicGroup + ' ); </label>';
            html += '<label>' + 'Pot: ' + warns.uathInt[i].resName + ' ( ' + warns.uathInt[i].resGroup + ' ) </label></li>';
        }
        html += '</ul></li>';

        html += '<ul>';

        $('.warn_cnt ul.mtree').html(html);
        $('.warn_cnt ul.mtree').checkTree();
    };
}


$(document).ready(function(){
    var int = new interaction();
    int.initiate();

    // // warning messages handling
    // $('.msg_prompt').click(function(){
    //     $(this).fadeOut(200);
    //     $('.warning').fadeIn(500);
    //     $('.show_area').css('height', '65%');
    // });
    //
    // // click X on the warning panel: hide it
    // $('.warning .glyphicon-remove').click(function(){
    //     $('.warning').fadeOut(200);
    //     $('.show_area').css('height', '88%');
    // });

    // click button 'All'
    $('.btns .all').click(function(){
        var eles = $('#show_tree div').filter('.checkbox');
        console.log('all: ', eles.length);
        for(var i = 0; i < eles.length; i++){
            $(eles[i]).addClass('checked');
        }
        $(this).css({'color': '#1976D2', 'background-color': 'white', 'border': '1px solid #1976D2', 'outline': '0'});
    });


    // click button 'Reset'
    $('.btns .reset').click(function(){
        $('#show_tree .checkbox').filter('.checked').removeClass('checked');
        $('#show_tree .checkbox').filter('.half_checked').removeClass('half_checked');
        $(this).css({'color': '#1976D2', 'background-color': 'white', 'border': '1px solid #1976D2', 'outline': '0'});
    });

    
    // // click button 'Confirm'
    $('.btns .confirm').click(function(){
        var ids = [];
        var eles = $('#show_tree .checkbox').filter('.checked');
        for(var i = 0; i < eles.length; i++){
            ids.push($(eles[i]).parent().attr('id'));
        }
        $(this).css({'color': '#1976D2', 'background-color': 'white', 'border': '1px solid #1976D2', 'outline': '0'});
        $('div').find('.legend').removeClass('hidee');
        int.drawTable(ids);
        int.drawGraph(ids);
    });


    // hover button 'All', button 'Reset' and button 'Confirm'
    $(".btn-default").hover(function(){
        $(this).css({'color': 'white', 'background-color': '#1976D2', 'border-color': '#1976D2'});
    }, function(){
        $(this).css({'color': '#1976D2', 'background-color': 'white', 'border-color': '#1976D2'});
    });

    // graph display
    $('.nav-item:first-child').click(function(){
        $(this).children('a').addClass('active');
        $(this).next().children('a').removeClass('active');
        $('.Dgraph').show();
        $('.Dtable').hide();
    });

    //table display
    $('.nav-item:last-child').click(function(){
        $(this).children('a').addClass('active');
        $(this).prev().children('a').removeClass('active');
        $('.Dgraph').hide();
        $('.Dtable').show();
    });

    int.drawAll();
});