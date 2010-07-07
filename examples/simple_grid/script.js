Ext.onReady(function() {

    var loadCount = 0;

    var lockgrid = null;

    var lockedColumns = new Ext.util.MixedCollection();

    /**** FUNCTIONS ***************************************************************************************************/

    var loadLockData = function() {
        var data = [], index = 0;
        lockedColumns.each(function(col) {
            index = 0;
            store.each(function(record) {
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
            lockgrid = new Ext.grid.GridPanel({
                stripeRows:true,
                cm:c,
                store:s,
                bodyStyle:"border-width:0 1px 0 0"
                ,listeners:{
                    afterrender:function(grid) {
                        loadLockData();
                        grid.getView().scroller.setStyle({overflow:"hidden"});
                    }
                }
            });
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

    var view = new Ext.ux.grid.livegrid.GridView({
        nearLimit:100,
        loadMask:{
            msg:"Buffering. Please wait..."
        }
        ,listeners:{
            cursormove:function(view, index) {
                if (lockgrid) lockgrid.getView().scroller.dom.scrollTop = (index - loadCount) * 21;
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
                if (hidden) lockColumn(cm, colIndex);
                else unlockColumn(cm, colIndex);
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
        selModel:new Ext.ux.grid.livegrid.RowSelectionModel(),
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
