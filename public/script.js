function graphql(query, variables = {}) {
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
        title
        resume
      }
    }
  `;

const GET_ARTICLE = `
    query GetArticle {
      article(where: { id: $id }) {
        title
        resume
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
            console.log(result);
            console.log(result.data);
            // Clear any existing elements from the list
            document.querySelector('.results').innerHTML = '';

            // Recreate the list and append it to the .results div
            const list = createList(result.data);
            document.querySelector('.results').appendChild(list);
        })
        .catch(function(error) {
            console.log(error);
            document.querySelector('.results').innerHTML = '<p>Error</p>';
        });
}

document.getElementById('articles').parentNode.innerHTML = `
<div class="app">
  <h1 class="main-heading">Bienvenue sur le journal de Nary</h1>
  <hr class="divider" />
  <div class="form-wrapper">
    <h2 class="app-heading">Liste des articles</h2>
    <div class="results">
      <p>Loading...</p>
    </div>
  </div>
</div>`;

// Fetch the initial data
fetchData();