/**
 * @author Anikesh Patel (DevAnikesh) <developeranikesh@gmail.com>
 * 12/11/2021
 */

const calcDisplayContainer = document.querySelector('.calc_display_container')
const resultBox = document.querySelector('.calc_display_container .result')
const calcInput = document.querySelector('.calc_display_container .calc_input')
const clearBtn = document.querySelector('.clear_btn')
const piBtn = document.querySelector('.pi_btn')
const equalBtn = document.querySelector('.equal_btn')
const pointBtn = document.querySelector('.point_btn')
const errorBox = document.querySelector('.error_box')
const degRadSwitch = document.querySelector('#deg_rad_switch')

let mode = 'rad'
const operators = ['+', '-', '/', '*', '(', ')', '%']

const isDegreeMode = () => mode === 'deg';

// Place to add new formulas in future
const customFormulas = {
  resin: num => num * 392.9
}
math.import(customFormulas)

const utils = {
  toDeg: num => num * (180 / 3.14159),
  toRad: num => num * 3.14159 / 180,
  getIndexOf: (from, of) => {
    let temp = from
    let index = -1
    while (temp.includes(of)) {
      index = temp.indexOf(of, index + 1)
      let char = temp.charAt(index - 1);
      if (char && isNaN(char) && !operators.find(op => op === char)) {
        continue
      } else if (index === -1) {
        break
      }
      return index
    }
    return from.length
  },
  count: (from, of) => {
    const res = from.match(new RegExp(`${of}`, 'gi')) || []
    return res.length
  }
}

document.querySelectorAll('.num_btn').forEach(el => {
  el.addEventListener('click', () => {
    calcInput.textContent += el.textContent
    calculateResult()
  })
})

document.querySelectorAll('.calc-action-btn').forEach(el => {
  el.addEventListener('click', () => {
    calcInput.textContent += el.textContent
    calculateResult()
  })
})

document.querySelectorAll('.formula_btns').forEach(el => {
  el.addEventListener('click', () => {
    calcInput.textContent += el.textContent + '('
    calculateResult()
  })
})

document.querySelectorAll('.bracket_btns').forEach(el => {
  el.addEventListener('click', () => {
    calcInput.textContent += el.textContent
    calculateResult()
  })
})

piBtn.addEventListener('click', () => {
  calcInput.textContent += 'pi'
  calculateResult()
})

pointBtn.addEventListener('click', () => {
  calcInput.textContent += '.'
  calculateResult()
})

calcInput.addEventListener('input', (e) => {
  calcInput.textContent = e.target.textContent
  calculateResult()
})

clearBtn.addEventListener('click', () => {
  calcInput.textContent = ''
  calculateResult()
})

equalBtn.addEventListener('click', () => {
  calculateResult(true)
})

degRadSwitch.addEventListener('change', (e) => {
  if (e.target.checked) {
    mode = 'deg'
  } else {
    mode = 'rad'
  }
  calculateResult()
})

function simplifyEq(equation) {
  let eq = equation

  let index = 0
  let count = utils.count(equation, 'sin') - utils.count(equation, 'resin') + utils.count(equation, 'cos')

  while (count !== 0) {
    const temp = eq.substr(index)
    let sinIndex = utils.getIndexOf(temp, 'sin(')
    let cosIndex = utils.getIndexOf(temp, 'cos(')

    const minIndex = Math.min(sinIndex, cosIndex)
    const addIndex = 4
    const closingIndex = temp.indexOf(')', minIndex)

    const value = temp.substring(minIndex + addIndex, closingIndex)
    let num = value
    try {
      num = math.evaluate(value)
    } catch (error) {
      num = value.toLowerCase() === 'pi' ? '3.14159' : value
    }
    if (!isNaN(num)) {
      num = parseFloat(num)
      num = isDegreeMode() ? utils.toRad(num) : num
      eq = eq.substring(0, index + minIndex + addIndex) + num.toString() + eq.substring(index + closingIndex)
      index += closingIndex
    } else {
      let nestedEq = value;
      const bracketCount = utils.count(value, '\\(');
      Array(bracketCount).fill(0).forEach(_ => {
        nestedEq += ')'
      })
      const shouldEval = (utils.count(nestedEq, 'sin') - utils.count(nestedEq, 'resin') + utils.count(nestedEq, 'cos') === 0) && isDegreeMode()
      if (shouldEval) {
        try {
          num = utils.toRad(math.evaluate(nestedEq))
          eq = eq.substring(0, index + minIndex + addIndex) + num.toString() + eq.substring(index + closingIndex + bracketCount)
        } catch (error) {
          console.log('DEBUG can\'t evaluate', eq);
        }
      }
      index += minIndex + addIndex
    }
    count--
  }
  console.log('\nDEBUG Final Result', eq);
  return eq
}


function calculateResult(showError = false) {
  try {
    const simplifiedEq = simplifyEq(calcInput.textContent.replace(/\s/g, ''))
    resultBox.textContent = `= ${math.evaluate(simplifiedEq) || 0}`
    errorBox.style.display = 'none'
    errorBox.textContent = ''
    calcDisplayContainer.classList.remove('error')
  } catch (error) {
    if (error.message) {
      if (showError) {
        errorBox.textContent = error.message
        errorBox.style.display = 'grid'
      }
      calcDisplayContainer.classList.add('error')
    }
  }

  setTimeout(() => {
    calcInput.focus()
    document.execCommand('selectAll', false, null)
    document.getSelection().collapseToEnd()
  }, 0);
}
