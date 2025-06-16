let allWorks = [];  // on declare un nouveau tableau pour utilisé la variable globalement

async function chargingProject(){           //  fonction pour afficher les projets
    try {                   
        const response = await fetch('http://localhost:5678/api/works');  // on demande a l'api

        if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const works = await response.json();           // on recupere la reponse de l'api au format json
        allWorks = works;
    } catch(error){
         console.error('Erreur lors de la récupération des données :', error);
    }
}

async function showFilters() {              //  fonction pour afficher les filtres
    try{
        const response = await fetch('http://localhost:5678/api/categories');

        if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const categorys = await response.json();
        for (let category of categorys){
            const categorysWrapper = document.querySelector('.filters_wrapper');
            const button = document.createElement('button');
            button.classList.add('filter');
            button.innerText = category.name;
            button.dataset.id = category.id;
            categorysWrapper.appendChild(button);

            button.addEventListener('click', () => {
                console.log(button.dataset)
            })
        }   
    }   catch(error){
         console.error('Erreur lors de la récupération des données :', error);
    }
}

function showProjects(){            //  fonction pour afficher les projets dans la gallerie
    for (let work of allWorks){
        const projectContainer = document.querySelector('.gallery');
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        figcaption.innerText = work.title;
        img.src = work.imageUrl;
        figure.appendChild(img, figcaption);
        projectContainer.appendChild(figure);
    }
}

(async () => {          
    await chargingProject();        //  on attend que la fonction ai fini de s'executer
    showProjects();
    showFilters();
})();


