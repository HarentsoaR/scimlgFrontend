"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/custom-scrollbar";
import axios from 'axios';
import { parseCookies } from 'nookies';
import ApprovalModal from './ApprovalModal'; // Adjust the import path as necessary
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AdminPublications = () => {
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.get('http://localhost:8080/articles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublications(response.data);
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  const filteredPublications = publications.filter(pub =>
    pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (id: number) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.patch(`http://localhost:8080/articles/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPublications(publications.map(pub =>
          pub.id === id ? { ...pub, status: 'approved' } : pub
        ));
        fetchPublications();
      }
    } catch (error) {
      console.error('Error approving publication:', error);
    }
  };

  const handleReject = async (id: number) => {
    const cookies = parseCookies();
    const token = cookies.access_token;

    try {
      const response = await axios.patch(`http://localhost:8080/articles/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setPublications(publications.map(pub =>
          pub.id === id ? { ...pub, status: 'rejected' } : pub
        ));
        fetchPublications();
      }
    } catch (error) {
      console.error('Error rejecting publication:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Publication Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search publications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPublications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell>{pub.title}</TableCell>
                    <TableCell>{pub.user.name}</TableCell>
                    <TableCell>{pub.status}</TableCell>
                    <TableCell>
                      {pub.status === 'under_review' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedPublication(pub);
                              setIsModalOpen(true);
                            }}
                          >
                            Approve
                            <CheckIcon className="w-4 h-4 ml-1" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className='text-red-600 underline-offset-4 hover:underline'
                            onClick={() => handleReject(pub.id)}
                          >
                            Reject
                            <XMarkIcon className="w-4 h-4 ml-1" />
                          </Button>
                        </>
                      )}
                      {pub.status === 'accepted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className='text-red-600 underline-offset-4 hover:underline'
                          onClick={() => handleReject(pub.id)}
                        >
                          Reject
                          <XMarkIcon className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      {pub.status === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPublication(pub);
                            setIsModalOpen(true);
                          }}
                        >
                          Approve
                          <CheckIcon className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <ApprovalModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
};

export default AdminPublications;
