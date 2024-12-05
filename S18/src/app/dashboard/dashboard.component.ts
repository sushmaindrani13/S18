import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 's18-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      // Store a flag in localStorage to show the prompt on the login page
      localStorage.setItem('showLoginPrompt', 'true');
      // Redirect to login page if no token exists
      this.router.navigate(['/login']);
    }
  }
}
