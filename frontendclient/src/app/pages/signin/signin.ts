import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../api/generated/users/users.service';
import { LoginRequest } from '../../api/models';
import { PageLoader } from '../../components/page-loader/page-loader';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLoader],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter both email and password';
      this.toastService.error('Please enter both email and password');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const startTime = Date.now();

    this.usersService.login(this.loginData).then(
      async (response: any) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        this.isLoading = false;
        this.toastService.success('Login successful! Redirecting to dashboard...');
        // Store token or user data if needed
        // localStorage.setItem('authToken', response.token);
        
        // Navigate to dashboard page after successful login
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      }
    ).catch(
      async (error: any) => {
        console.error('Login failed:', error);
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsedTime);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Login failed. Please check your credentials.';
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
      }
    );
  }
}
