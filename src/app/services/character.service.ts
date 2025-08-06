import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private baseUrl = 'https://swapi.info/api/people';

  constructor(private http: HttpClient) {}

  private cache = new Map<string, Observable<any>>();

  private getCached(url: string): Observable<any> {
    if (!this.cache.has(url)) {
      const req$ = this.http.get<any>(url).pipe(shareReplay(1));
      this.cache.set(url, req$);
    }
    return this.cache.get(url)!;
  }

  getAllCharacters(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      switchMap((characters: any[]) => {
        const expandedCharacters$ = characters.map((char: any) =>
          this.expandCharacter(char)
        );
        return forkJoin(expandedCharacters$);
      })
    );
  }

  private expandCharacter(char: any): Observable<any> {
    const getDataArray = (urls: string[] | undefined) =>
      urls && urls.length
        ? forkJoin(urls.map((url) => this.getCached(url)))
        : of([]);

    const homeworld$ = char.homeworld
      ? this.getCached(char.homeworld)
      : of({ name: 'N/A' });

    const species$ = getDataArray(char.species);
    const films$ = getDataArray(char.films);
    const vehicles$ = getDataArray(char.vehicles);
    const starships$ = getDataArray(char.starships);

    return forkJoin({
      homeworld: homeworld$,
      species: species$,
      films: films$,
      vehicles: vehicles$,
      starships: starships$,
    }).pipe(
      map((expanded) => ({
        ...char,
        homeworldName: expanded.homeworld.name || 'N/A',
        speciesNames:
          expanded.species.map((s: any) => s.name).join(', ') || 'N/A',
        filmTitles: expanded.films.map((f: any) => f.title).join(', ') || 'N/A',
        vehicleNames:
          expanded.vehicles.map((v: any) => v.name).join(', ') || 'N/A',
        starshipNames:
          expanded.starships.map((s: any) => s.name).join(', ') || 'N/A',
      }))
    );
  }

  getCharacterById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getPlanetByUrl(url: string) {
    return this.getCached(url);
  }

  getAllFilms() {
    return this.http.get<any[]>('https://swapi.info/api/films');
  }

  getAllSpecies() {
    return this.http.get<any[]>('https://swapi.info/api/species');
  }

  getAllVehicles() {
    return this.http.get<any[]>('https://swapi.info/api/vehicles');
  }

  getAllStarships() {
    return this.http.get<any[]>('https://swapi.info/api/starships');
  }

  fetchDetails(urls: string[]): Observable<any[]> {
    return forkJoin(urls.map((url) => this.getCached(url)));
  }
}
