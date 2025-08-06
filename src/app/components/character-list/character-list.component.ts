// character-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css'],
  standalone:false
})
export class CharacterListComponent implements OnInit {
  characters: any[] = [];
  filteredCharacters: any[] = [];
  loading = true;

  selectedMovie = '';
  selectedSpecies = '';
  selectedVehicle = '';
  selectedStarship = '';
  birthYearFrom: number | null = null;
  birthYearTo: number | null = null;

  movies: any[] = [];
  speciesList: any[] = [];
  vehiclesList: any[] = [];
  starshipsList: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characterService.getAllCharacters().subscribe((data) => {
      this.characters = data.map((char: any) => ({
        ...char,
        id: this.getIdFromUrl(char.url),
      }));
      this.filteredCharacters = [...this.characters];
      this.updatePagination();
      this.loading = false;
    });

    this.characterService.getAllFilms().subscribe((data) => {
      this.movies = data;
    });

    this.characterService.getAllSpecies().subscribe((data) => {
      this.speciesList = data;
    });

    this.characterService.getAllVehicles().subscribe((data) => {
      this.vehiclesList = data;
    });

    this.characterService.getAllStarships().subscribe((data) => {
      this.starshipsList = data;
    });
  }

  get pagedCharacters() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCharacters.slice(start, start + this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  updatePagination() {
    this.totalPages =
      Math.ceil(this.filteredCharacters.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  applyFilters() {
    this.filteredCharacters = this.characters.filter((char) => {
      if (
        this.selectedMovie &&
        (!char.filmTitles || !char.filmTitles.includes(this.selectedMovie))
      )
        return false;

      if (
        this.selectedSpecies &&
        (!char.speciesNames || !char.speciesNames.includes(this.selectedSpecies))
      )
        return false;

      if (
        this.selectedVehicle &&
        (!char.vehicleNames || !char.vehicleNames.includes(this.selectedVehicle))
      )
        return false;

      if (
        this.selectedStarship &&
        (!char.starshipNames ||
          !char.starshipNames.includes(this.selectedStarship))
      )
        return false;

      if (this.birthYearFrom !== null || this.birthYearTo !== null) {
        if (!char.birth_year) return false;
        const yearNum = this.convertBirthYearToNumber(char.birth_year);
        if (yearNum === null) return false;
        if (this.birthYearFrom !== null && yearNum < this.birthYearFrom)
          return false;
        if (this.birthYearTo !== null && yearNum > this.birthYearTo)
          return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  onSearch() {
    this.applyFilters();
  }

  convertBirthYearToNumber(birthYear: string): number | null {
    if (!birthYear) return null;
    const year = parseFloat(birthYear);
    if (birthYear.includes('BBY')) return -year;
    if (birthYear.includes('ABY')) return year;
    return null;
  }

  getIdFromUrl(url: string): number | null {
    const match = url.match(/\/people\/(\d+)(\/|$)/);
    return match ? +match[1] : null;
  }
}
