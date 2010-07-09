Ext.onReady(function() {

    var datagrid = new Ext.ux.datagrid.DataGridPanel({
        height:400
        ,width:800
        ,title:"DataGrid"
    });

    datagrid.render(Ext.getBody());

});
