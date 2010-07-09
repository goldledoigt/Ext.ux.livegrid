Ext.ns("Ext.ux.datagrid");

Ext.ux.datagrid.LockGrid = Ext.extend(Ext.grid.GridPanel, {

    initComponent:function() {

        this.reverseRowStripe = false;

        Ext.ux.datagrid.LockGrid.superclass.initComponent.call(this);

        this.on({
            render:this.renderGroupHeaders
            ,reconfigure:this.renderGroupHeaders
        });

    }

    ,renderGroupHeaders:function() {
        var livegrid = this.ownerCt.ownerCt.livegrid;
        var h = livegrid.el.select("div.x-grid3-header-offset table").elements;
        var children = [];
        var headers = Ext.get(this.el.select("div.x-grid3-header-offset").elements[0]);
        var table = headers.child("table");
        for (var i = 0; i < livegrid.getColumnModel().rows.length; i++) {
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
    }

    ,setScroll:function(scrollTop) {
        this.getView().scroller.dom.scrollTop = scrollTop;
    }

    ,loadData:function() {
        var data = [], index = 0;
        var parentCt = this.ownerCt.ownerCt;
        var lockedColumns = parentCt.lockedColumns;
        var records = parentCt.livegrid.getStore().getRange();
        lockedColumns.each(function(col) {
            index = 0;
            Ext.each(records, function(record) {
                if (index === 0) {
                    if (record.get("number") % 2) {
                        this.getView().reverseRowStripe = true;
                    } else {
                        this.getView().reverseRowStripe = false;
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
            }, this);
        }, this);
        this.getStore().loadData(data);
    }

});
