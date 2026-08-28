import Company from "../models/company.model.js";
import DEFAULT_COMPANY from "../util/prompt.js";


function getOrCreateDefaultCompany() {
  return Company.findOneAndUpdate(
    { name: DEFAULT_COMPANY.name },
    { $set: DEFAULT_COMPANY },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export { getOrCreateDefaultCompany };
