const $get = key => document.querySelector(key)
const $getAll = key => document.querySelectorAll(key)
const $create = element => document.createElement(element)
const $remove = element => element.remove()
const $removeAllChilds = parent => {
   while(parent.lastChild) {
      parent.removeChild(parent.lastChild)
   }
}
const $createOption = (value, innerText = value) => {
   const option = $create("option")
   option.value = value
   option.innerText = innerText
   return option
}

const padLeadingZero = num => (num < 10) ? "0" + num : num

const dayContainer = $get("#date-day")
const monthContainer = $get("#date-month")
const yearContainer = $get("#date-year")
const date = new Date()

day = padLeadingZero(date.getDate())
dayContainer.innerText = day

month = padLeadingZero(date.getMonth() + 1)
monthContainer.innerText = month

year = date.getFullYear()
yearContainer.innerText = year

const shortDate = `${day}/${month}/${year}`
$get("#bcv-date").innerText = shortDate

const emptyValue = '----------'

const fields = $getAll(".field")
fields.forEach(field => field.innerText = emptyValue)

$get("form").addEventListener("keyup", ({target}) => {
   if(target.tagName == "INPUT" && target.classList.contains("manual-input")) {
      const inputID = target.id
      const field = $get(`#${inputID}-field`)
      field.innerText = (target.value === '') ? emptyValue : target.value
   }
}) 

function setProductSelect(products) {
   const select = $get("#product-select")
   products.forEach((product, index) => {
      const option = $createOption(index, product.keyName)
      select.append(option)
   })
}

function setCategorySelect(categories) {
   const select = $get("#category-select")
   const productSelect = $get("#product-select")
   
   select.addEventListener("change", ({target}) => {
      const category = target.value
      $removeAllChilds(productSelect)
      setProductSelect(categories[category])   
   })
   
   const sortedKeys = Object.keys(categories).sort()
   sortedKeys.forEach(category => {
      const option = $createOption(category)
      select.append(option)
   }) 
   
   setProductSelect(categories[select.value])
}

function fillProductField(containerKey, innerText, rowIndex) {
   const container = $get(containerKey)
   const span = $create("span")
   span.classList.add(rowIndex)
   span.innerText = innerText
   container.append(span)
}

function setAddProductButton(data) {
   const button = $get("#add-product-button")
   let totalPrice = 0
   let currentRow = 1

   $get("#order-container").addEventListener("click", ({target}) => {
      if(target.tagName == "IMG") {
         const row = target.classList.item(0)
         $getAll(`.${row}`).forEach(element => $remove(element))
      }
   })

   button.addEventListener("click", () => {
      const category = $get("#category-select").value

      const quantity = $get("#quantity-input").value
      fillProductField("#quantity-container", quantity, `row${currentRow}`)

      const productIndex = +$get("#product-select").value
      const product = data[category][productIndex]
      const {name, uPrice} = product
      fillProductField("#product-container", name.substring(0,75), `row${currentRow}`)

      const bcvRate = +$get("#bcv-rate").value
      const uPriceBs = uPrice * bcvRate
      fillProductField("#unit-price-container", uPriceBs.toFixed(2), `row${currentRow}`)

      const orderPriceBs = uPriceBs * quantity
      fillProductField("#order-price", orderPriceBs.toFixed(2), `row${currentRow}`)
      totalPrice += orderPriceBs

      const trash = $create("img")
      trash.alt = "ícono de basura"
      trash.src = "./trash-icon.svg"
      trash.classList.add(`row${currentRow}`, "trash-icon")
      $get("#order-price span:last-child").append(trash)

      const subtotal = $get("#subtotal")
      subtotal.innerText = totalPrice.toFixed(2)

      const totalWithoutTaxes = $get("#total-without-taxes")
      totalWithoutTaxes.innerText = totalPrice.toFixed(2)

      const taxes = $get("#taxes") 
      const iva = 16
      const taxesBs = (totalPrice * iva) / 100
      taxes.innerText = taxesBs.toFixed(2)

      const totalWithTaxes = $get("#total-with-taxes")
      totalWithTaxes.innerText = (taxesBs + totalPrice).toFixed(2)

      const orderPriceDollars = $get("#order-price-dollars")
      orderPriceDollars.innerText = (totalPrice / bcvRate).toFixed(2) + "$"

      currentRow++
   })
}

async function app() {
   const apiURL = 'https://raw.githubusercontent.com/corpchemicals/products-list/main/products.json'
   const response = await fetch(apiURL)
   const data = await response.json()
   setCategorySelect(data)
   setAddProductButton(data)
}

app()