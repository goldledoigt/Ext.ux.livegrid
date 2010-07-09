Ext.onReady(function() {

    var loadCount = 0;

    var reverseRowStripe = false;

    var lockgrid = null;

    var lockedColumns = new Ext.util.MixedCollection();

    /**** FUNCTIONS ***************************************************************************************************/

    /*
    var getColumnGroups = function(cm, colIndex) {
        var colspan = 0, groups = [];
        Ext.each(cm.rows, function(row) {
            colspan = 0;
            Ext.each(row, function(group) {
                //console.log("each", colspan, colIndex, group.colspan);
                if (colspan <= colIndex && colIndex < group.colspan + colspan) {
                    groups.push(group);
                    console.log("OK");   
                }
                colspan += group.colspan;
            });
        });
        return groups;
    };
    */

    var renderGroupHeaders = function() {
        var h = grid.el.select("div.x-grid3-header-offset table").elements;
        var children = [];
        var headers = Ext.get(lockgrid.el.select("div.x-grid3-header-offset").elements[0]);
        var table = headers.child("table");
        console.log("headers", headers, table, table.getWidth());
        for (var i = 0; i < grid.getColumnModel().rows.length; i++) {
            var ih = headers.insertFirst({
                tag:"table"
                ,width:table.getWidth()
                ,cellspacing:0
                ,cellpadding:0
                ,children:[{
                    tag:"tr"
                    ,cls:"x-grid3-hd-row"
                    ,children:[{
                        tag:"td"
                        ,cls:"x-grid3-hd x-grid3-hd-empty x-grid3-cell x-grid3-td-"+i+" x-grid3-cell-first"
                        ,style:{
                            height:Ext.fly(h[i]).getHeight() + "px"
                        }
                    }]
                }]
            });
        }

        console.log("IH", ih);
/*
        lockgrid.on({
            bodyresize:function() {
                console.log("resize", el, el.getWidth());
                ih.setWidth(el.getWidth());
            }
        });
*/

    }

    var loadLockData = function() {
        var data = [], index = 0;
        lockedColumns.each(function(col) {
            index = 0;
            store.each(function(record) {

                if (index === 0) {
                    if (record.get("number") % 2) {
                        reverseRowStripe = true;
                    } else {
                        reverseRowStripe = false;
                    }
                }

                var r = [];
                r[col.dataIndex] = record.get(col.dataIndex);
                if (data[index]) {
                    Ext.apply(data[index], r);
                } else {
                    data[index] = r;
                }
                index++
            });
        });
        lockgrid.getStore().loadData(data);
    };

    var lockColumn = function(cm, colIndex) {
        var col = cm.config[colIndex];
        lockedColumns.add(col.dataIndex,  col);
        buildLockGrid();
    };

    var buildLockGrid = function() {
        var columns = [], fields = [], width = 0;

        lockedColumns.each(function(col) {
            width += parseInt(col.width);
            fields.push(col.dataIndex);
            columns.push({
                header:col.header
                ,dataIndex:col.dataIndex
                ,width:col.width
            });
        });

        var c = new Ext.grid.ColumnModel(columns);

        var s = new Ext.data.JsonStore({
            fields:fields
        });

        if (!lockgrid) {

            var view = new Ext.grid.GridView({
                processRows : function(startRow, skipStripe) {
                    //console.log("processRows", arguments);
                    if (!this.ds || this.ds.getCount() < 1) {
                        return;
                    }

                    var rows = this.getRows(),
                        len  = rows.length,
                        i, r;

                    skipStripe = skipStripe || !this.grid.stripeRows;
                    startRow   = startRow   || 0;
                    for (i = 0; i<len; i++) {
                        r = rows[i];
                        if (r) {
                            r.rowIndex = i;
                                r.className = r.className.replace(this.rowClsRe, ' ');
                                if (!reverseRowStripe &&((i + 1) % 2 === 0)){
                                    r.className += ' x-grid3-row-alt';
                                } else if (reverseRowStripe && ((i + 1) % 2 !== 0)){
                                    r.className += ' x-grid3-row-alt';
                                }
                            //}
                        }
                    }

                    if (startRow === 0) {
                        Ext.fly(rows[0]).addClass(this.firstRowCls);
                    }

                    Ext.fly(rows[rows.length - 1]).addClass(this.lastRowCls);
                }
            });

            lockgrid = new Ext.grid.GridPanel({
                stripeRows:true,
                cm:c,
                store:s,
                view:view,
                bodyStyle:"border-width:0 1px 0 0"
                ,listeners:{
                    afterrender:function(grid) {
                        loadLockData();
                        grid.getView().scroller.setStyle({overflow:"hidden"});
                    }
                    ,rowselect:function(sm, rowIndex, record) {
                        lockgrid.getSelectionModel().selectRow(rowIndex - loadCount);
                    }
                    ,render:renderGroupHeaders
                    ,reconfigure:renderGroupHeaders
                }
            });

            lockgrid.relayEvents(grid.getSelectionModel(), ["rowselect", "rowdeselect"]);
            lockpanel.add(lockgrid);
        } else {
            lockgrid.reconfigure(s, c);
            loadLockData();
        }
        lockpanel.setWidth(width);
        panel.doLayout();
    };

    var unlockColumn = function(cm, colIndex) {
        var col = cm.config[colIndex];
        lockedColumns.removeKey(col.dataIndex);
        buildLockGrid();
    };

    /**** GRID CONFIG *************************************************************************************************/

    var group = new Ext.ux.grid.ColumnHeaderGroup({
        rows: [[
            {header:"Supa Group 1", colspan:3}
            ,{header:"Supa Group 2", colspan:5}                
        ], [
            {header:"Group 1", colspan:3}
            ,{header:"Group 2", colspan:2}
            ,{header:"Group 3", colspan:3}
        ]]
    });

    var view = new Ext.ux.grid.livegrid.GridView({
        nearLimit:100,
        loadMask:{
            msg:"Buffering. Please wait..."
        }
        ,listeners:{
            cursormove:function(view, index) {
                if (lockgrid) lockgrid.getView().scroller.dom.scrollTop = (index - loadCount) * 21;
            }
            ,rowover:function(view, rowIndex) {
                if (lockgrid)
                    lockgrid.getView().addRowClass(rowIndex - loadCount, "x-grid3-row-over");
            }
            ,rowout:function(view, rowIndex) {
                if (lockgrid)
                    lockgrid.getView().removeRowClass(rowIndex - loadCount, "x-grid3-row-over");
            }
        }
    });

    var reader = new Ext.ux.grid.livegrid.JsonReader({
        root:"data",
        versionProperty:"version",
        totalProperty :"totalCount",
        id:"id"
    }, [
        {name:"number", sortType:"int"}
        ,{name:"text", sortType:"string"}
        ,{name:"date", sortType:"int"}
        ,{name:"col0", sortType:"string"}
        ,{name:"col1", sortType:"string"}
        ,{name:"col2", sortType:"string"}
        ,{name:"col3", sortType:"string"}
        ,{name:"col4", sortType:"string"}
    ]);

    var store = new Ext.ux.grid.livegrid.Store({
        autoLoad:true,
        url:"./server.php",
        bufferSize:300,
        reader:reader,
        sortInfo:{field:"number", direction:"ASC"}
        ,listeners:{
            load:function(store) {
                loadCount = store.data.items[0].data.number;
                if (lockgrid) {
                    loadLockData();
                    lockgrid.getView().scroller.dom.scrollTop = 0;
                }
            }
        }
    });

    var cm = new Ext.grid.ColumnModel({
        columns:[
            {header:"Number", align:"left",   width:160, sortable:true, dataIndex:"number"},
            {header:"String", align:"left",   width:160, sortable:true, dataIndex:"text"},
            {header:"Date",   align:"right",  width:160, sortable:true, dataIndex:"date"},
            {header:"Column 0", align:"left",   width:160, sortable:true, dataIndex:"col0"},
            {header:"Column 1", align:"left",   width:160, sortable:true, dataIndex:"col1"},
            {header:"Column 2", align:"left",   width:160, sortable:true, dataIndex:"col2"},
            {header:"Column 3", align:"left",   width:160, sortable:true, dataIndex:"col3"},
            {header:"Column 4", align:"left",   width:160, sortable:true, dataIndex:"col4"}
        ]
        ,listeners:{
            hiddenchange:function(cm, colIndex, hidden) {
                if (hidden) {
                    lockColumn(cm, colIndex);
                } else {
                    unlockColumn(cm, colIndex);
                }
            }
        }
    });

    var grid = new Ext.ux.grid.livegrid.GridPanel({
        region:"center",
        stripeRows:true,
        enableDragDrop:false,
        loadMask:{msg:"Loading..."},
        store:store,
        cm:cm,
        view:view,
        border:false,
        plugins:group,
        selModel:new Ext.ux.grid.livegrid.RowSelectionModel({
            listeners:{
                rowselect:function() {

                }
            }
        }),
        listeners:{
            afterrender:function() {
                this.getView().hmenu.add({text:"lock", handler:function() {
                    console.log("lock");
                }});
            }
        }
    });

     var toolbar = new Ext.ux.grid.livegrid.Toolbar({
         view:view,
         displayInfo:true
     });

    var lockpanel = new Ext.Panel({
        region:"west",
        layout:"fit",
        border:false,
        width:0
    });

    var panel = new Ext.Panel({
        height:400,
        width:800,
        title:"Large table",
        layout:"border",
        bbar:toolbar,
        items:[grid, lockpanel]
    });

    panel.render(Ext.getBody());

});
