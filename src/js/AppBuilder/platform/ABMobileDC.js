/**
 * ABMobileDC
 *
 * This is the platform dependent implementation of our DataCollection object.
 *
 * The ABDataCollection objects are designed around working with an instance
 * of a Webix Datacollection to manage getting the data into the various UI
 * elements.
 *
 * Now on Framework7 we have to work with F7 stores.  This object is designed
 * to follow our existing Object API, while working with F7 Stores to update
 * the UI.
 *
 * GOAL: we will implement an object that mimics the Webix.DataCollection
 * features that are used in our CORE part of the codebase.  And then recode
 * our PLATFORM.DataCollection to approach things more in line with F7
 *
 */

import ABEmitter from "./ABEmitter";

export default class ABMobileDC extends ABEmitter {
   constructor(Options) {
      super(/*{ maxListeners: 0 }*/);

      this.data = Options.data || [];
      this.DC = Options.DC;

      this.cursorID = null;

      // Mock the ABDataCollectionCore.init(): initialization of the
      // "changeCursor" event:
      this.___AD = { onAfterCursorChange: () => true };
   }

   //
   // 1) We need to connect our DC to a parent DC that we are linked to.
   // Once the Parent DC is selected, we need to pull the current selection
   // and then perform another reload() based upon
   bind(DC, id) {}

   // 2) continuous Scrolling:
   //    Implemented at the level of the UI component:
   //    <div onInfinite={ this.loadMore() }
   //    loadMore() {
   //       if (this.DC.hasMore()) {
   //          this.DC.loadMore(); // <<-- DC will update the $store
   //       }
   //    }
   /*

 dc.bind(dataCollectionLink.__dataCollection, fieldLink.id);
// defining dataFeed allows us to query the database when the table is scrolled
dc.define("dataFeed", (value, params) => {
   let cursorUpdated = false;
   // check if the current cursor was updated
   if (this?.datacollectionLink?.getCursor()?.id == value) {
      cursorUpdated = true;
   }

   // this is the same item that was already bound...don't reload data
   if (cursorUpdated) {
      // now that we have the modified wheres the dataCollections wheres
      // need to be modified for subsequent loads on scroll so lets set them
      // this.reloadWheres(wheres);

      // reload data
      this.reloadData(0, 20);
   }
});

*/

   get PK() {
      return this.DC.datasource.PK();
   }

   stateValues() {
      if (!this.DC.$state) return (this.DC.$state = []);
      return this.DC.$state[this.DC.id];
   }

   add(value, indx) {
      if (!Array.isArray(value)) {
         value = [value];
      }
      let allValues = this.stateValues();
      allValues.splice(indx, 0, ...value);
      this.setValues(allValues);
   }

   clearAll() {
      this.setValues([]);
      this.cursorID = null;
   }

   count() {
      return this.stateValues().length;
   }

   exists(ID) {
      let allValues = this.stateValues();
      let found = allValues.find((v) => ID == this.id(v));
      return "undefined" !== typeof found;
   }

   /**
    * filter(fn)
    * Apply a filter to the current data set.
    */
   filter(fn) {
      this.__unfilteredData = this.stateValues();

      if (typeof fn == "undefined") {
         this.setValues(this.__unfilteredData);
         delete this.__unfilteredData;
         return;
      }

      this.setValues(this.__unfilteredData.filter(fn));
   }

   find(fn = () => true) {
      if (typeof fn != "function") {
         if (typeof fn == "object") {
            if (Object.keys(fn).length == 0) {
               fn = () => true;
            } else {
               throw new Error("Improper parameter to .find():", fn);
            }
         }
      }
      return this.stateValues().filter(fn);
   }

   /**
    * @method getCursor()
    * returns the ID of the item the cursor is set to.
    * @return {string}
    */
   getCursor() {
      return this.cursorID;
   }

   getFirstId() {
      var allValues = this.stateValues();
      if (allValues.length == 0) return null;
      return this.id(allValues[0]);
   }

   getNextId(id) {
      var idxFound = -1;
      var PK = this.PK;
      var allValues = this.stateValues();
      for (var i = 0, val_len = allValues.length; i < val_len; i++) {
         if (this.id(allValues[i]) == id) {
            idxFound = i;
            break;
         }
      }

      if (idxFound == -1) {
         return null;
      }

      return this.id(allValues[idxFound + 1]);
   }

   id(value) {
      return value[this.PK] || value.id || value.uuid;
   }

   getItem(id) {
      var PK = this.PK;
      var allValues = this.stateValues();
      if (id == null || allValues == null || allValues.length === 0 )
         return null;
      return allValues.find((v) => this.id(v) == id);
   }

   /**
    * @method load()
    * can be called with a
    * - data
    */
   load(fn) {
      if ("function" == typeof fn) {
         var result = fn();
         // did the fn() return a Promise?
         // if so, then wait for the result and pass to .parse()
         if (result?.then) {
            result.then((data) => {
               if (data) this.parse(data);
            });
         } else {
            // pass the result on to .parse()
            if (result) this.parse(result);
         }
      } else {
         this.parse(fn);
      }
   }

   /**
    * @method parse()
    * take the provided data response from the server and store the
    * data into our $store.
    * data format could be the response packet:
    *    {data: [], total_count: 11, pos: 0, offset: 0, limit: 20}
    * or just the array of data to store: []
    */
   parse(data) {
      // check to see if data is in expanded format:
      // { data, pos, total_count, }

      let dataIn = data.data || data;
      let pos = data.pos || 0;
      let tc = data.total_count || 0;

      if (Array.isArray(dataIn) && dataIn.length == 0) {
         if (tc == 0) {
            // this is an actual empty data set.
            this.clearAll();
         }
         return;
      }

      if (pos == 0) {
         this.setValues(dataIn);
      } else {
         let allValues = this.stateValues();
         allValues.splice(pos, 0, ...dataIn);
         this.setValues(allValues);
      }

      // remove any stored filter
      delete this.__unfilteredData;
   }

   remove(id) {
      var PK = this.PK;
      var allValues = this.stateValues();
      this.setValues(allValues.filter((v) => this.id(v) != id));

      if (this.__unfilteredData) {
         this.__unfilteredData = this.__unfilteredData.filter(
            (v) => this.id(v) != id
         );
      }

      if (this.cursorID == id) this.cursorID = null;
   }

   setCursor(ID) {
      this.cursorID = ID;
      this.emit("onAfterCursorChange");

      // ABDataCollectionCore.init() : attempts to set up this dynamic,
      // but we are initializing this here instead:
      let currCursorItem = this.getItem(ID);
      this.DC.emit("changeCursor", currCursorItem);
   }

   setValues(data) {
      // this.DC.dataInitialized();
      this.DC.$state[this.DC.id] = data;
   }

   updateItem(ID, data) {
      let item = this.getItem(ID);
      for (var p in data) {
         if (data.hasOwnProperty(p)) {
            item[p] = data[p];
         }
      }

      var allValues = this.stateValues().map((v) => {
         if ((v.id || v.uuid) == (data.id || data.uuid)) {
            return item;
         } else {
            return v;
         }
      });

      this.setValues(allValues);
   }

   // DataCollectionCore.setCursor()
   /*

   attachEvent(str, fn() ) // onAfterCursorChange
   updateItem(d.id,updateItemData);

   loadNext(count, start);
*/
}
