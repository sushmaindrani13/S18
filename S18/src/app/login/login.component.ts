import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 's18-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  username: string = '';
  password: string = '';
  loginError: string | null = null;
  showPrompt: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if the login prompt flag exists in localStorage
    if (localStorage.getItem('showLoginPrompt') === 'true') {
      this.showPrompt = true;
      // Remove the flag so it doesn't show again
      localStorage.removeItem('showLoginPrompt');
    }
  }

  onSubmit(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        window.history.replaceState(null, '', '/dashboard'); // Update URL
        this.router.navigate(['/dashboard']); // Redirect to dashboard on successful login
      },
      error: () => {
        this.loginError = 'Invalid username or password';
      }
    });
  }
}


