const INDEX_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users'
const ID_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/'
const dataPanel = document.querySelector('#data-panel')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
const people = []
const peopPerPage = 24
const paginator = document.querySelector('#paginator')
let filterPeople = []


function renderPeople(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML +=
      `<div class="col-sm-3">
        <div class="mb-3">
            <div class="card text-center">
              <img class="card-img-top  img-fluid" src="${item.avatar}" alt="Selfie">
              <div class="card-body">
                <h3 class="card-text font-weight-bold">
                  ${item.surname} <br>
                </h3>
                <p class="card-text">
                  Region: ${item.region} <br>
                </p>
              </div>
              <div class="card-footer">
            <button class="btn btn-warning btn-show-people text-white" data-toggle="modal" data-target="#people-modal" data-id="${item.id
      }">More</button>
      <button class="btn btn-danger btn-add-favorite text-white"  data-id="${item.id
      }">+</button>
              </div>
          </div>
        </div>
      </div>`

    dataPanel.innerHTML = rawHTML

  })

}


function showPeopleModal(id) {
  // get elements

  const modalName = document.querySelector('#people-modal-name')
  const modalEmail = document.querySelector('#people-modal-email')
  const modalImage = document.querySelector('#people-modal-image')
  // send request to show api
  axios.get(ID_URL + id).then((response) => {
    const data = response.data
    // insert data into modal ui
    modalName.innerText = 'Hi, I am ' + data.name + "."
    modalEmail.innerText = 'Please send me by ' + data.email + ' for any discussisions, I am excited to get your mail !'
    modalImage.innerHTML = `<img class="card-img-top" src="${data.avatar}" alt="Selfie">`
  })
}

//新增
function getPeopleByPage(page) {

  let startIndex = (page - 1) * peopPerPage

  const data = filterPeople.length ? filterPeople : people
  return data.slice(startIndex, (startIndex + peopPerPage))

}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / peopPerPage)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML


}


function addToFavorite(id) {
  //用list取出localStorage
  const list = JSON.parse(localStorage.getItem('favoritePeople')) || []
  //找出person
  const person = people.find((person) => person.id === id)
  if (list.some((person) => person.id === id)) {
    return alert('已經在收藏清單中！')
  }
  list.push(person)
  localStorage.setItem('favoritePeople', JSON.stringify(list))
}

//點擊增加鍵後，按鈕顏色變化
function buttonChangeColor(item) {
  if (item.classList.contains('btn-danger')) {
    item.classList.remove('btn-danger')
    item.classList.add('btn-secondary')
  }
}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  console.log(event.target)
  if (event.target.matches('.btn-show-people')) {
    showPeopleModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    buttonChangeColor(event.target)
  }

})


//search bar
searchForm.addEventListener('click', function onSearchForm(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toUpperCase()


  if (event.target.matches('.btn-primary')) {

    if (!keyword.length) {
      return alert('Please enter the words !')
    }

    people.forEach(item => {
      if (item.region.includes(keyword)) {
        filterPeople.push(item)
      }

    })

    if (filterPeople.length === 0) {
      return alert('No result!')
    }
    renderPaginator(filterPeople.length)
    renderPeople(getPeopleByPage(1))
  }



})

//分頁點擊事件
paginator.addEventListener('click', event => {

  const pageNow = Number(event.target.dataset.page)
  renderPeople(getPeopleByPage(pageNow))


})

//動態取得資料
axios
  .get(INDEX_URL)
  .then((response) => {
    people.push(...response.data.results)
    renderPaginator(people.length)
    renderPeople(getPeopleByPage(1))
    //console.log(people)
  })
  .catch((err) => console.log(err))

