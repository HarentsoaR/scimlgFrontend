"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from 'react-apexcharts';
import axios from 'axios';
import { parseCookies } from 'nookies';

const AdminStatistics = () => {
  const [userCount, setUserCount] = useState(0);
  const [publicationCount, setPublicationCount] = useState(0);
  const [mostLikedArticles, setMostLikedArticles] = useState([]);

  // Fetch user count
  useEffect(() => {
    const fetchUserCount = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/users/statistics/count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserCount(response.data);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch publication count
  useEffect(() => {
    const fetchPublicationCount = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/articles/statistics/count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPublicationCount(response.data);
      } catch (error) {
        console.error('Error fetching publication count:', error);
      }
    };

    fetchPublicationCount();
  }, []);

  // Fetch most liked articles
  useEffect(() => {
    const fetchMostLikedArticles = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/likes/statistics/most-liked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMostLikedArticles(response.data);
      } catch (error) {
        console.error('Error fetching most liked articles:', error);
      }
    };

    fetchMostLikedArticles();
  }, []);

  // Prepare data for ApexCharts
  const prepareChartData = (data) => {
    const titles = data.map(article => article.title);
    const likeCounts = data.map(article => article.likeCount);

    return {
      series: [{
        name: 'Likes',
        data: likeCounts,
      }],
      options: {
        chart: {
          type: 'bar',
        },
        xaxis: {
          categories: titles,
        },
        title: {
          text: 'Most Liked Articles',
        },
      },
    };
  };

  const mostLikedArticlesChartData = prepareChartData(mostLikedArticles);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Publications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publicationCount}</div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Most Liked Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={mostLikedArticlesChartData.options}
            series={mostLikedArticlesChartData.series}
            type="bar"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatistics;
