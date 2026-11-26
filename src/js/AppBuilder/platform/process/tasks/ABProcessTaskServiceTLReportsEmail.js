import TLReportsEmailCore from "../../../core/process/tasks/ABProcessTaskServiceTLReportsEmailCore.js";

// The task runs on the server (process_manager). The mobile platform only needs
// the class so processes that use it can be loaded on the device.
export default class TLReportsEmail extends TLReportsEmailCore {}
