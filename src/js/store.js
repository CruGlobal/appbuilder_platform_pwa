import { createStore } from "framework7";

export default (AB, appVersion = "") => {
   const allDCs = AB.datacollections();

   const configStore = {
      state: {
         // "0e9f5f6f-cd0b-4b93-b0c8-d51bd9852322": [],
         // "19e566e3-a6b0-4ed5-83ea-a42b1ddbf5c5": [],
         user: { username: "" },
         version: "",
      },
      getters: {
         // "0e9f5f6f-cd0b-4b93-b0c8-d51bd9852322"({ state }) {
         //    return state["0e9f5f6f-cd0b-4b93-b0c8-d51bd9852322"];
         // },
         // "19e566e3-a6b0-4ed5-83ea-a42b1ddbf5c5"({ state }) {
         //    return state["19e566e3-a6b0-4ed5-83ea-a42b1ddbf5c5"];
         // },
         user({ state }) {
            return state["user"];
         },
         version({ state }) {
            return state.version;
         },
      },
      actions: {
         getAppBuilderData({ state }, id) {
            let DC = AB.datacollectionByID(id);
            DC.setState(state);
            DC.loadData();
         },
         setUser({ state }, user) {
            state["user"] = user;
         },
         updateRecord({ state }, props) {
            let records = [...state[props.dcID].records];
            let foundIndex = records.findIndex((x) => x.uuid == props.recordID);
            let recordToUpdate = records[foundIndex];

            for (var propt in props.record) {
               if (Object.prototype.hasOwnProperty.call(recordToUpdate, propt))
                  recordToUpdate[propt] = props.record[propt];
            }
            state[props.dcID] = {
               loading: false,
               hasMore: records.length >= 60 ? false : true,
               records: records,
            };
         },
         getVersion({ state }) {
            state.version = appVersion;
         },
      },
   };

   allDCs.forEach((DC) => {
      DC.initStore(configStore);
   });

   const store = createStore(configStore);

   return store;
};
