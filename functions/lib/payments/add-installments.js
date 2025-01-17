const IPInterestMonthly = require('./ip-interest-monthly.json')

module.exports = (amount, installments = {}, gateway = {}, response) => {
  let maxInterestFree = installments.max_interest_free
  const maxInstallments = installments.max_number || 12
  if (maxInstallments > 1) {
    if (response) {
      response.installments_option = {
        min_installment: 1,
        max_number: maxInterestFree > 1 ? maxInterestFree : maxInstallments,
        monthly_interest: maxInterestFree > 1 ? 0 : IPInterestMonthly[maxInstallments - 1]
      }
    }

    // list installment options
    gateway.installment_options = []
    for (let number = 2; number <= maxInstallments; number++) {
      const tax = !(maxInterestFree >= number)
      let interest
      if (tax) {
        interest = IPInterestMonthly[number - 1] / 100
      }
      const value = !tax ? amount.total / number : amount.total * (interest / (1 - Math.pow(1 + interest, -number)))
      if (value && value >= 1) {
        gateway.installment_options.push({
          number,
          value,
          tax
        })
      }
    }
  }
  return { response, gateway }
}
