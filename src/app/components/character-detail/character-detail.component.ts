import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CharacterService } from '../../services/character.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.css'],
  standalone: false,
})
export class CharacterDetailComponent implements OnInit {
  characterId!: number;
  character: any;
  loading = true;
  error: string | null = null;

  films: any[] = [];
  speciesList: any[] = [];
  vehiclesList: any[] = [];
  starshipsList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.characterId = Number(idParam);
        this.loadAllDataAndCharacter(this.characterId);
      } else {
        this.error = 'Invalid character ID.';
        this.loading = false;
      }
    });
  }

  loadAllDataAndCharacter(id: number) {
    this.loading = true;

    forkJoin({
      character: this.characterService.getCharacterById(id),
      films: this.characterService.getAllFilms(),
      speciesList: this.characterService.getAllSpecies(),
      vehiclesList: this.characterService.getAllVehicles(),
      starshipsList: this.characterService.getAllStarships(),
    }).subscribe({
      next: ({
        character,
        films,
        speciesList,
        vehiclesList,
        starshipsList,
      }) => {
        this.character = character;
        this.films = films;
        this.speciesList = speciesList;
        this.vehiclesList = vehiclesList;
        this.starshipsList = starshipsList;

        this.resolveCharacterDetails();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.error = 'Character or related data not found.';
        this.loading = false;
      },
    });
  }

  resolveCharacterDetails() {
    if (this.character.homeworld) {
      this.characterService.getPlanetByUrl(this.character.homeworld).subscribe({
        next: (planet) => {
          this.character.homeworldName = planet.name;
        },
        error: () => {
          this.character.homeworldName = 'Unknown';
        },
      });
    } else {
      this.character.homeworldName = 'Unknown';
    }

    this.character.speciesNames =
      this.character.species && this.character.species.length > 0
        ? this.character.species
            .map((url: string) => {
              const specie = this.speciesList.find((s) => s.url === url);
              return specie ? specie.name : 'Unknown';
            })
            .join(', ')
        : 'N/A';

    this.character.filmTitles =
      this.character.films && this.character.films.length > 0
        ? this.character.films
            .map((url: string) => {
              const film = this.films.find((f) => f.url === url);
              return film ? film.title : 'Unknown';
            })
            .join(', ')
        : 'N/A';

    this.character.vehicleNames =
      this.character.vehicles && this.character.vehicles.length > 0
        ? this.character.vehicles
            .map((url: string) => {
              const vehicle = this.vehiclesList.find((v) => v.url === url);
              return vehicle ? vehicle.name : 'Unknown';
            })
            .join(', ')
        : 'N/A';

    this.character.starshipNames =
      this.character.starships && this.character.starships.length > 0
        ? this.character.starships
            .map((url: string) => {
              const starship = this.starshipsList.find((s) => s.url === url);
              return starship ? starship.name : 'Unknown';
            })
            .join(', ')
        : 'N/A';
  }
}
