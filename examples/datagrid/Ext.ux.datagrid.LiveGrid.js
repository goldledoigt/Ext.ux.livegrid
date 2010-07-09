Ext.ns("Ext.ux.datagrid");

Ext.ux.datagrid.LiveGrid = Ext.extend(Ext.ux.grid.livegrid.GridPanel, {

    initComponent:function() {

        this.selModel = new Ext.ux.grid.livegrid.RowSelectionModel();

        var groups = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                {header:"Supa Group 1", colspan:3}
                ,{header:"Supa Group 2", colspan:5}
            ], [
                {header:"Group 1", colspan:3}
                ,{header:"Group 2", colspan:2}
                ,{header:"Group 3", colspan:3}
            ]]
        });

        this.view = new Ext.ux.grid.livegrid.GridView({
            nearLimit:100,
            loadMask:{
                msg:"Buffering. Please wait..."
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

        this.store = new Ext.ux.grid.livegrid.Store({
            autoLoad:true,
            url:"./server.php",
            bufferSize:300,
            reader:reader,
            sortInfo:{field:"number", direction:"ASC"}
        });

        this.cm = new Ext.grid.ColumnModel({
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
        });

        this.selModel = new Ext.ux.grid.livegrid.RowSelectionModel();

        this.plugins = [groups];

        Ext.ux.datagrid.LiveGrid.superclass.initComponent.call(this);
    }

});



