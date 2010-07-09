Ext.ns("Ext.ux.datagrid");

Ext.ux.datagrid.DataGridPanel = Ext.extend(Ext.Panel, {

    initComponent:function() {

        this.loadCount = 0;

        this.lastCursorIndex = 0;

        this.lockgrid = null;

        this.lockedColumns = new Ext.util.MixedCollection();

        this.livegrid = new Ext.ux.datagrid.LiveGrid({
            region:"center"
            ,stripeRows:true
            ,enableDragDrop:false
            ,loadMask:{msg:"Loading..."}
            ,border:false
        });

        this.toolbar = new Ext.ux.grid.livegrid.Toolbar({
            view:this.livegrid.getView(),
            displayInfo:true
        });

        Ext.apply(this, {
            layout:"border"
            ,bbar:this.toolbar
            ,items:[this.livegrid, {
                region:"west"
                ,ref:"lockpanel"
                ,width:0
                ,layout:"fit"
                ,border:false                
            }]
        });

        Ext.ux.datagrid.DataGridPanel.superclass.initComponent.call(this);

        this.livegrid.getStore().on({
            scope:this
            ,load:function(store, records, options) {
                this.loadCount = records[0].data.number;
                if (this.lockgrid) {
                    this.lockgrid.loadData();
                    // TODO: need to calculate srollTop on each load
                    this.lockgrid.setScroll(0 /*(this.lastCursorIndex - this.loadCount) * 21*/);
                }
            }

        });

        this.livegrid.getColumnModel().on({
            scope:this
            ,hiddenchange:function(cm, colIndex, hidden) {
                if (hidden) {
                    this.lockColumn(cm, colIndex);
                } else {
                    this.unlockColumn(cm, colIndex);
                }
            }            
        });

        this.livegrid.getView().on({
            scope:this
            ,cursormove:function(view, index) {
                this.lastCursorIndex = index;
                if (this.lockgrid)
                    this.lockgrid.setScroll((index - this.loadCount) * 21);
            }
            ,rowover:function(view, rowIndex) {
                if (this.lockgrid)
                    this.lockgrid.getView().addRowClass(rowIndex - this.loadCount, "x-grid3-row-over");
            }
            ,rowout:function(view, rowIndex) {
                if (this.lockgrid)
                    this.lockgrid.getView().removeRowClass(rowIndex - this.loadCount, "x-grid3-row-over");
            }
        });

    }

    ,lockColumn:function(cm, colIndex) {
        var col = cm.config[colIndex];
        this.lockedColumns.add(col.dataIndex,  col);
        this.buildLockGrid(col);
    }

    ,unlockColumn:function(cm, colIndex) {
        var col = cm.config[colIndex];
        this.lockedColumns.removeKey(col.dataIndex);
        this.buildLockGrid();
    }

    ,buildLockGrid:function(col) {
        var columns = [], fields = [], width = 0;

        this.lockedColumns.each(function(col) {
            width += parseInt(col.width);
            fields.push(col.dataIndex);
            columns.push({
                header:col.header
                ,dataIndex:col.dataIndex
                ,width:col.width
            });
        });

        var cm = new Ext.grid.ColumnModel(columns);

        var store = new Ext.data.JsonStore({
            fields:fields
        });

        if (!this.lockgrid) {

            var view = new Ext.grid.GridView({
                reverseRowStripe:false
                ,processRows : function(startRow, skipStripe) {
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
                            if (!this.reverseRowStripe &&((i + 1) % 2 === 0)){
                                r.className += ' x-grid3-row-alt';
                            } else if (this.reverseRowStripe && ((i + 1) % 2 !== 0)){
                                r.className += ' x-grid3-row-alt';
                            }
                        }
                    }

                    if (startRow === 0) {
                        Ext.fly(rows[0]).addClass(this.firstRowCls);
                    }

                    Ext.fly(rows[rows.length - 1]).addClass(this.lastRowCls);
                }
            });

            this.lockgrid = new Ext.ux.datagrid.LockGrid({
                stripeRows:true,
                cm:cm,
                store:store,
                view:view,
                bodyStyle:"border-width:0 1px 0 0"
                ,listeners:{
                    scope:this
                    ,afterrender:function(grid) {
                        grid.loadData();
                        grid.getView().scroller.setStyle({overflow:"hidden"});
                    }
                    ,rowselect:function(sm, rowIndex, record) {
                        this.lockgrid.getSelectionModel().selectRow(rowIndex - this.loadCount);
                    }
                }
            });
            this.lockgrid.relayEvents(this.livegrid.getSelectionModel(), ["rowselect", "rowdeselect"]);
            this.lockpanel.add(this.lockgrid);

        } else {
            this.lockgrid.reconfigure(store, cm);
            this.lockgrid.loadData();
        }

        this.lockpanel.setWidth(width);
        this.doLayout();
    }

});

Ext.reg("datagrid", Ext.ux.datagrid.DataGridPanel);

