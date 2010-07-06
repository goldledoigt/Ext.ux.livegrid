Ext.onReady(function() {

  var loadCount = 0;

  var view = new Ext.ux.grid.livegrid.GridView({
    nearLimit:100,
    loadMask:{
      msg:"Buffering. Please wait..."
    }
    ,listeners:{
      cursormove:function(view, index) {
	console.log("buffer", this, arguments);
	lockgrid.getView().scroller.dom.scrollTop = (index - loadCount) * 21;
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
	console.log(store, loadCount);
	lockgrid.getView().refresh();
	lockgrid.getView().scroller.dom.scrollTop = 0;
      }
      /*
      ,selectionsload:function(store) {
	console.log(store, lockgrid);
	lockgrid.getView().refresh();
      }
       */
    }
  });

  var cm = new Ext.grid.ColumnModel([
    {header:"Number", align:"left",   width:160, sortable:true, dataIndex:"number"},
    {header:"String", align:"left",   width:160, sortable:true, dataIndex:"text"},
    {header:"Date",   align:"right",  width:160, sortable:true, dataIndex:"date"}
  ]);
/*
  var toolbar = new Ext.ux.grid.livegrid.Toolbar({
    view:view,
    displayInfo:true
  });
*/
  var grid = new Ext.ux.grid.livegrid.GridPanel({
    region:"center",
    stripeRows:true,
    enableDragDrop:false,
    loadMask:{msg:"Loading..."},
    store:store,
    cm:cm,
    view:view,
//    bbar:toolbar,
    selModel:new Ext.ux.grid.livegrid.RowSelectionModel()
  });

  var lockgrid = new Ext.grid.GridPanel({
    region:"west",
    width:200,
    stripeRows:true,
    cm:cm,
    store:store
  });

  var panel = new Ext.Panel({
    height:400,
    width:800,
    title:"Large table",
    layout:"border",
    items:[grid, lockgrid]
  });

  panel.render(Ext.getBody());

});
