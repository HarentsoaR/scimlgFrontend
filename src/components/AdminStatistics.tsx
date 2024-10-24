"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Chart from 'react-apexcharts';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { Users, BookOpen, ThumbsUp, MessageSquare, Star } from 'lucide-react';

const AdminStatistics = () => {
  const [userCount, setUserCount] = useState(0);
  const [publicationCount, setPublicationCount] = useState(0);
  const [mostLikedArticles, setMostLikedArticles] = useState([]);
  const [mostCommentedArticles, setMostCommentedArticles] = useState([]);
  const [ratingStatistics, setRatingStatistics] = useState([]);

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

   // Fetch most commented articles
   useEffect(() => {
    const fetchMostCommentedArticles = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/comments/statistics/most-commented', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMostCommentedArticles(response.data);
      } catch (error) {
        console.error('Error fetching most commented articles:', error);
      }
    };

    fetchMostCommentedArticles();
  }, []);

  // Fetch rating statistics
  useEffect(() => {
    const fetchRatingStatistics = async () => {
      const cookies = parseCookies();
      const token = cookies.access_token;

      try {
        const response = await axios.get('http://localhost:8080/evaluations/statistics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatingStatistics(response.data);
      } catch (error) {
        console.error('Error fetching rating statistics:', error);
      }
    };

    fetchRatingStatistics();
  }, []);

  // Prepare data for ApexCharts for ratings
  const prepareRatingChartData = (data) => {
    const titles = data.map(stat => stat.title);
    const averageRatings = data.map(stat => parseFloat(stat.averageRating).toFixed(2));

    return {
      series: [{
        name: 'Average Rating',
        data: averageRatings,
      }],
      options: {
        chart: {
          type: 'bar',
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: titles,
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        colors: ['#10B981'],
        title: {
          text: 'Average Ratings per Article',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      },
    };
  };

  // Prepare data for most commented articles chart
  const prepareChartCommentData = (data) => {
    const titles = data.map(article => article.title);
    const commentCount = data.map(article => article.commentCount);

    return {
      series: [{
        name: 'Comments',
        data: commentCount,
      }],
      options: {
        chart: {
          type: 'bar',
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: titles,
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        colors: ['#6366F1'],
        title: {
          text: 'Most Commented Articles',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      },
    };
  };

  // Prepare data for most liked articles chart
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
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: titles,
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        colors: ['#F59E0B'],
        title: {
          text: 'Most Liked Articles',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      },
    };
  };

  // Prepare data for rating distribution pie chart
  const prepareRatingDistributionData = (data) => {
    const distribution = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0 };

    data.forEach(stat => {
      const rating = parseFloat(stat.averageRating);
      if (rating < 2) distribution['1-2']++;
      else if (rating < 3) distribution['2-3']++;
      else if (rating < 4) distribution['3-4']++;
      else distribution['4-5']++;
    });

    return {
      series: Object.values(distribution),
      options: {
        chart: {
          type: 'donut',
        },
        labels: Object.keys(distribution),
        colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
        title: {
          text: 'Rating Distribution',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
        legend: {
          position: 'bottom',
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
    };
  };

  // Prepare chart data
  const ratingChartData = prepareRatingChartData(ratingStatistics);
  const mostLikedArticlesChartData = prepareChartData(mostLikedArticles);
  const ratingDistributionData = prepareRatingDistributionData(ratingStatistics);
  const mostCommentedArticlesData = prepareChartCommentData(mostCommentedArticles)

  return (
    <ScrollArea>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Publications</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicationCount}</div>
              <p className="text-xs text-muted-foreground">Published articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Liked</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mostLikedArticles[0]?.likeCount || 0}</div>
              <p className="text-xs text-muted-foreground">Likes on top article</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(...ratingStatistics.map(stat => parseFloat(stat.averageRating))).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Highest average rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="likes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>
          <TabsContent value="likes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Liked Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  options={mostLikedArticlesChartData.options}
                  series={mostLikedArticlesChartData.series}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Commented Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  options={mostCommentedArticlesData.options}
                  series={mostCommentedArticlesData.series}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ratings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Average Ratings per Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    options={ratingChartData.options}
                    series={ratingChartData.series}
                    type="bar"
                    height={350}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <Chart
                    options={ratingDistributionData.options}
                    series={ratingDistributionData.series}
                    type="donut"
                    height={350}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ScrollBar />
    </ScrollArea>
  );
};

export default AdminStatistics;