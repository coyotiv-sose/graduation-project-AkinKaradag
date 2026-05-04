export function pendingOrders(orders) {
  return orders.filter(order => order.state === 'PENDING')
}

export function inProcessOrders(orders) {
  return orders.filter(order => order.state === 'IN_PROCESS')
}

export function availableVehicles(vehicles) {
  return vehicles.filter(vehicle => vehicle.state === 'AVAILABLE')
}

export function vehicleName(vehicle) {
  return vehicle.name || `${vehicle.brand} ${vehicle.model}`
}
