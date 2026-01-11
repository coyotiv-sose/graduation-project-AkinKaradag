class Employee{
  constructor(name, role){
    this.name = name
    this.role = role
  }

  planTour(company, vehicle, ...data) {
    if (this.role === 'Dispatcher') {
      return company.createTour(vehicle, ...data)
  }

}
}
module.exports = Employee