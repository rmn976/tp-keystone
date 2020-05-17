function graphql(query, variables = {}) {
    console.log(variables);
    console.log(query);
    return fetch('/admin/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            variables,
            query,
        }),
    }).then(function(result) {
        return result.json();
    });
}

const GET_ARTICLES = `
    query GetArticles {
      allArticles(where: { publish: true }) {
        id
        title
        resume
      }
    }
  `;

const GET_CATEGORIES = `
    query GetCategories {
      allCategories {
        name
      }
    }
  `;

const GET_ARTICLE = `
    query GetArticle($id: ID!) {
      Article(where: { id: $id }) {
        title
        content
      }
    }
  `;

function createArticleItem(article) {

    // Create the list item
    const articleItem = document.createElement('div');
    articleItem.classList.add('article-item');

    const linkItem = document.createElement('a');
    linkItem.setAttribute('href', '#');
    linkItem.classList.add('link-item');
    linkItem.addEventListener('click', () => { fetchData2(article.id) });
    articleItem.appendChild(linkItem);

    const articleTitle = document.createElement('h3');
    articleTitle.innerHTML = article.title;
    linkItem.appendChild(articleTitle);

    const articleResume = document.createElement('p');
    articleResume.innerHTML = article.resume;
    linkItem.appendChild(articleResume);

    return articleItem;
}

function createList(data) {
    // Create the list
    const list = document.createElement('ul');
    list.classList.add('list');
    data.allArticles.forEach(function(article) {
        list.appendChild(createArticleItem(article));
    });
    return list;
}

function fetchData() {
    graphql(GET_ARTICLES)
        .then(function(result) {
            // Clear any existing elements from the list
            document.querySelector('.results').innerHTML = '';

            // Recreate the list and append it to the .results div
            const list = createList(result.data);
            document.querySelector('.results').appendChild(list);
            document.querySelector('#accueil').addEventListener('click', () => { fetchData() });
        })
        .catch(function(error) {
            console.log(error);
            document.querySelector('.results').innerHTML = '<p>Error</p>';
        });
}

function createDropdown(data) {
    // Create the list
    const dropdown = document.querySelector('.dropdown-menu');
    data.allCategories.forEach(function(category) {
        dropdown.appendChild(createCategoryItem(category));
    });
    return dropdown;
}

function createCategoryItem(category) {

    // Create the list item
    const categoryItem = document.createElement('a');
    categoryItem.classList.add('dropdown-item');
    categoryItem.setAttribute('href', '#');
    categoryItem.innerHTML = category.name;

    return categoryItem;
}

function fetchData3() {
    graphql(GET_CATEGORIES)
        .then(function(result) {
            // Clear any existing elements from the list
            document.querySelector('.dropdown-menu').innerHTML = '';

            // Recreate the list and append it to the .results div
            createDropdown(result.data);
        })
        .catch(function(error) {
            console.log(error);
            document.querySelector('.dropdown-menu').innerHTML = '<p>Error</p>';
        });
}


function createArticleItem2(article) {

    // Create the item
    const articleItem = document.createElement('div');
    articleItem.classList.add('article-item');

    const articleTitle = document.createElement('h3');
    articleTitle.classList.add('title-item');
    articleTitle.innerHTML = article.title;
    articleItem.appendChild(articleTitle);

    const articleContent = document.createElement('h3');
    articleContent.innerHTML = article.content;
    articleItem.appendChild(articleContent);

    return articleItem;
}

function fetchData2(id) {
    graphql(GET_ARTICLE, { id: id })
        .then(function(result) {
            // Clear any existing elements from the list
            document.querySelector('.results').innerHTML = '';

            // Recreate the list and append it to the .results div
            const article = createArticleItem2(result.data.Article);
            document.querySelector('.results').appendChild(article);
        })
        .catch(function(error) {
            console.log(error);
            document.querySelector('.results').innerHTML = '<p>Error</p>';
        });
}

document.getElementById('articles').parentNode.innerHTML = `
<div class="app">
    <h1 class="main-heading">Bienvenue sur le journal de Nary</h1>
    <ul class="nav nav-pills">
        <li class="nav-item">
            <a class="nav-link" id="accueil" role="button" href="#">Accueil</a>
        </li>
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Catégorie</a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Aucune catégorie</a>
            </div>
        </li>  
    </ul>
    <div class="form-wrapper">
        <h2 class="app-heading">Liste des articles</h2>
        <div class="results">
        <p>Loading...</p>
        </div>
    </div>
</div>`;

// Fetch the initial data
fetchData();
fetchData3();