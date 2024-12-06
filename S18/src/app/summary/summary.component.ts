import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface ChartData {
  source: string;
  value: number;
}

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  private svg: any;
  private margin = 110;
  private width = 750 - this.margin * 2;
  private height = 550 - this.margin * 2;
  public data: ChartData[] = [];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      // Store a flag in localStorage to show the prompt on the login page
      localStorage.setItem('showLoginPrompt', 'true');
      // Redirect to login page if no token exists
      this.router.navigate(['/login']);
    }
    else {
      this.fetchChartData();
    }
  }

  private fetchChartData(): void {
    const token = localStorage.getItem('token');
    console.log(token)
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<{ data: ChartData[] }>('http://137.184.219.254:3000/charts/summary-chart', { headers }).subscribe({
      next: (response) => {
        this.data = response.data;
        this.createSvg();
        this.drawBars(this.data);
      },
      error: (err) => {
        console.error('Error fetching chart data:', err);
        alert('Failed to fetch chart data.');
      }
    });
  }

  private createSvg(): void {
    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', `translate(${this.margin}, ${this.margin})`);
  }

  private drawBars(data: ChartData[]): void {
    // Create X-axis
    const x = d3
      .scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.source))
      .padding(0.2);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Create Y-axis
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0]) // Default to 0 if no data exists
      .range([this.height, 0]);

    this.svg.append('g').call(d3.axisLeft(y));

    // Create bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: ChartData) => x(d.source)!)
      .attr('y', (d: ChartData) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: ChartData) => this.height - y(d.value))
      .attr('fill', '#69b3a2');
  }
}
