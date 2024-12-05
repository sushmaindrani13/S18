import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 's18-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout(); // Clear the token
    this.router.navigate(['/login']); // Redirect to the login page
  }
}
