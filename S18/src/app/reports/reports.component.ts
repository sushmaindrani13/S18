import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import * as d3 from 'd3';

interface ReportChartData {
  category: string;
  percentage: number;
}

@Component({
  selector: 's18-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})

export class ReportsComponent implements OnInit {
  private svg: any;
  private margin = 50;
  private width = 750 - this.margin * 2;
  private height = 400 - this.margin * 2;
  public data: ReportChartData[] = [];

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
    this.http.get<{ data: ReportChartData[] }>('http://localhost:3000/charts/reports-chart', { headers }).subscribe({
      next: (response) => {
        this.data = response.data;
        this.createSvg();
        this.drawPie(this.data);
      },
      error: (err) => {
        console.error('Error fetching chart data:', err);
        alert('Failed to fetch chart data.');
      }
    });
  }

  private createSvg(): void {
    this.svg = d3
      .select('figure#pie')
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', `translate(${this.width / 2 + this.margin}, ${this.height / 2 + this.margin})`);
  }

  private drawPie(data: ReportChartData[]): void {
    console.log(data)
    const radius = Math.min(this.width, this.height) / 2;

    // Create pie generator
    const pie = d3.pie<ReportChartData>().value(d => d.percentage);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<ReportChartData>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Define color scale
    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => d.category))
      .range(d3.schemeCategory10);

    // Draw slices
    this.svg
      .selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('d', arc)
      .attr('fill', (d: d3.PieArcDatum<ReportChartData>) => color(d.data.category)) // Explicitly typed `d`
      .attr('stroke', '#ffffff')
      .style('stroke-width', '2px');

    // Add labels
    this.svg
      .selectAll('.label')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('class', 'label')
      .text((d: d3.PieArcDatum<ReportChartData>) => `${d.data.category}: ${d.data.percentage}%`) // Explicitly typed `d`
      .attr('transform', (d: d3.PieArcDatum<ReportChartData>) => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px');
  }
}

