let allWorks = [];  // on declare un nouveau tableau pour utilisé la variable works globalement

const projectContainer = document.querySelector('.gallery');
const categorysWrapper = document.querySelector('.filters_wrapper');
    
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
        const response = await fetch('http://localhost:5678/api/categories');       // on demande a l'api

        if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const allButton = document.createElement('button');         // creation du bouton Tous
        allButton.innerText = "Tous";
        allButton.classList.add('filter');
        categorysWrapper.appendChild(allButton);
        
        allButton.addEventListener('click', () => {
            projectContainer.innerHTML = "";
            showProjects(allWorks);
        })

        const categorys = await response.json();            
        for (let category of categorys){
            const button = document.createElement('button');
            button.classList.add('filter');
            button.innerText = category.name;
            button.dataset.id = category.id;
            categorysWrapper.appendChild(button);

            button.addEventListener('click', () => {    //  ajout d'un event sur les boutons
                projectContainer.innerHTML = "";
                const categoryId = parseInt(button.dataset.id);   //  on convertit la chaine de caracteres en nombre (me fait trop souvent galerer)
                const filteredWorks = allWorks.filter(            //  on creer une varaiable avec les projet filtrés via .filter(parametre du filtre)
                    work => work.categoryId === categoryId
                );
                showProjects(filteredWorks);    //   on affiche que les projets filtrés
            })
        }   
    }   catch(error){
         console.error('Erreur lors de la récupération des données :', error);
    }
}

function showProjects(worksToShow) {     //   fonction pour afficher les projets dans la gallerie (on reprend le tableau worksToShow en parametre pour afficher que ce que je veux du tableau, je filtrai bien le tableau mais je reafficher a chaque fois TOUT les projets du coup je comprenais pas)
    projectContainer.innerHTML = "";
    for (let work of worksToShow) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        img.src = work.imageUrl;
        figcaption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        projectContainer.appendChild(figure);
    }
}

(async () => {          
    await chargingProject();        //  on attend que la fonction ai fini de s'executer
    showProjects(allWorks);
    showFilters(); 
})();