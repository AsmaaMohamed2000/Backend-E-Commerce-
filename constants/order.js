   const allowedTransitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["processing", "cancelled"],
        processing: ["shipped"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
        returned: []
    };
    module.exports=allowedTransitions