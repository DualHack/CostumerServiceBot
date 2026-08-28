import Customer from '../models/customer.model.js';

function getOrCreateCustomer(company, whatsappId, name) {
  return Customer.findOneAndUpdate(
    { company: company._id, whatsappId: whatsappId },
    {
      $set: {
        name: name || '',
        phoneNumber: whatsappId.split('@')[0],
        lastSeenAt: new Date()
      },
      $setOnInsert: { company: company._id, whatsappId: whatsappId }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export { getOrCreateCustomer };
