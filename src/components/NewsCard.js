const template = document.createElement('template');
template.innerHTML = `
    <style>
        .card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transform: perspective(1000px) rotateX(0deg);
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: perspective(1000px) rotateX(5deg);
        }
        .image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
        }
        .title {
            color: var(--text-dark);
            margin: 1rem 0;
        }
        .add-watchlist {
            background: var(--secondary-blue);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
    <div class="card">
        <img src="" alt="" class="image">
        <h3 class="title"></h3>
        <p></p>
        <button class="add-watchlist">Add to Watchlist</button>
    </div>
`;

export class NewsCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    set news(data) {
        this.render(data);
    }

    render(data) {
        this.shadowRoot.querySelector('.image').src = data.image;
        this.shadowRoot.querySelector('.image').alt = data.title;
        this.shadowRoot.querySelector('.title').innerText = data.title;
        this.shadowRoot.querySelector('p').innerText = data.summary;
    }
}

customElements.define('news-card', NewsCard);