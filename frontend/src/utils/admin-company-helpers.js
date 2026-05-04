export function createEmptyCompanyForm() {
  return {
    companyName: '',
    address: '',
    postalCode: '',
    city: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  }
}

export function companyFormFromCompany(company) {
  return {
    ...createEmptyCompanyForm(),
    companyName: company.companyName || '',
    address: company.address || '',
    postalCode: company.postalCode || '',
    city: company.city || '',
  }
}
