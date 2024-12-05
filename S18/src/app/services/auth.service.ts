import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token); // Store the JWT token
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token'); // Remove token on logout
  }

  getToken(): string | null {
    return localStorage.getItem('token'); // Retrieve token from storage
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // Check if token exists
  }
}
