import Customer from '../models/customer.model.js';

function getOrCreateCustomer(whatsappId, name) {
  return Customer.findOne({ whatsappId: whatsappId }).then(function (existingCustomer) {
    if (existingCustomer) {
      return Customer.findByIdAndUpdate(existingCustomer._id, {
        $set: {
          name: name || existingCustomer.name,
          phoneNumber: whatsappId.split('@')[0],
          lastSeenAt: new Date()
        }
      }, { new: true }).then(function (customer) {
        return { customer: customer, isNewUser: false };
      });
    }

    return Customer.create({
      whatsappId: whatsappId,
      phoneNumber: whatsappId.split('@')[0],
      name: name || ''
    }).then(function (customer) {
      return { customer: customer, isNewUser: true };
    });
  });
}

export { getOrCreateCustomer };
