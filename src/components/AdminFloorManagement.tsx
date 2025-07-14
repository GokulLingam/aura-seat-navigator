import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Edit, Trash2, Building, MapPin, Monitor, Save, X } from 'lucide-react';
import { floorPlanApiService, type Building, type Floor, type Desk, type FloorLayout } from '@/services/floorPlanApiService';

const AdminFloorManagement: React.FC = () => {
  // State for buildings
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingData, setBuildingData] = useState<Partial<Building>>({});

  // State for floors
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isFloorDialogOpen, setIsFloorDialogOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorData, setFloorData] = useState<Partial<Floor>>({});

  // State for desks
  const [desks, setDesks] = useState<Desk[]>([]);
  const [isDeskDialogOpen, setIsDeskDialogOpen] = useState(false);
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [deskData, setDeskData] = useState<Partial<Desk>>({});

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [buildingsData, floorsData, desksData] = await Promise.all([
        floorPlanApiService.getBuildings(),
        floorPlanApiService.getFloors(),
        floorPlanApiService.getDesks()
      ]);
      
      setBuildings(buildingsData);
      setFloors(floorsData);
      setDesks(desksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Building management
  const handleCreateBuilding = async () => {
    if (!buildingData.name) return;

    try {
      setIsSaving(true);
      const newBuilding = await floorPlanApiService.createBuilding({
        name: buildingData.name,
        address: buildingData.address || '',
        city: buildingData.city || '',
        country: buildingData.country || ''
      });
      
      setBuildings(prev => [...prev, newBuilding]);
      setIsBuildingDialogOpen(false);
      setBuildingData({});
      setSuccessMessage('Building created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create building');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBuilding = async () => {
    if (!editingBuilding || !buildingData.name) return;

    try {
      setIsSaving(true);
      const updatedBuilding = await floorPlanApiService.updateBuilding(editingBuilding.id, buildingData);
      
      setBuildings(prev => prev.map(b => b.id === editingBuilding.id ? updatedBuilding : b));
      setIsBuildingDialogOpen(false);
      setEditingBuilding(null);
      setBuildingData({});
      setSuccessMessage('Building updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update building');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (!confirm('Are you sure you want to delete this building? This will also delete all associated floors and desks.')) {
      return;
    }

    try {
      await floorPlanApiService.deleteBuilding(buildingId);
      setBuildings(prev => prev.filter(b => b.id !== buildingId));
      setSuccessMessage('Building deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete building');
    }
  };

  // Floor management
  const handleCreateFloor = async () => {
    if (!floorData.name || !floorData.building_id || !floorData.floor_number) return;

    try {
      setIsSaving(true);
      const newFloor = await floorPlanApiService.createFloor({
        name: floorData.name,
        building_id: floorData.building_id,
        floor_number: floorData.floor_number,
        description: floorData.description || '',
        is_active: floorData.is_active ?? true
      });
      
      setFloors(prev => [...prev, newFloor]);
      setIsFloorDialogOpen(false);
      setFloorData({});
      setSuccessMessage('Floor created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create floor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFloor = async () => {
    if (!editingFloor || !floorData.name) return;

    try {
      setIsSaving(true);
      const updatedFloor = await floorPlanApiService.updateFloor(editingFloor.id, floorData);
      
      setFloors(prev => prev.map(f => f.id === editingFloor.id ? updatedFloor : f));
      setIsFloorDialogOpen(false);
      setEditingFloor(null);
      setFloorData({});
      setSuccessMessage('Floor updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update floor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    if (!confirm('Are you sure you want to delete this floor? This will also delete all associated desks.')) {
      return;
    }

    try {
      await floorPlanApiService.deleteFloor(floorId);
      setFloors(prev => prev.filter(f => f.id !== floorId));
      setSuccessMessage('Floor deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete floor');
    }
  };

  // Desk management
  const handleCreateDesk = async () => {
    if (!deskData.desk_number || !deskData.floor_id) return;

    try {
      setIsSaving(true);
      const newDesk = await floorPlanApiService.createDesk({
        desk_number: deskData.desk_number,
        floor_id: deskData.floor_id,
        x_position: deskData.x_position || 0,
        y_position: deskData.y_position || 0,
        width: deskData.width || 100,
        height: deskData.height || 100,
        status: deskData.status || 'available',
        desk_type: deskData.desk_type || 'standard',
        equipment: deskData.equipment || {
          monitor: false,
          keyboard: false,
          phone: false
        },
        is_active: deskData.is_active ?? true
      });
      
      setDesks(prev => [...prev, newDesk]);
      setIsDeskDialogOpen(false);
      setDeskData({});
      setSuccessMessage('Desk created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create desk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDesk = async () => {
    if (!editingDesk || !deskData.desk_number) return;

    try {
      setIsSaving(true);
      const updatedDesk = await floorPlanApiService.updateDesk(editingDesk.id, deskData);
      
      setDesks(prev => prev.map(d => d.id === editingDesk.id ? updatedDesk : d));
      setIsDeskDialogOpen(false);
      setEditingDesk(null);
      setDeskData({});
      setSuccessMessage('Desk updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update desk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDesk = async (deskId: string) => {
    if (!confirm('Are you sure you want to delete this desk?')) {
      return;
    }

    try {
      await floorPlanApiService.deleteDesk(deskId);
      setDesks(prev => prev.filter(d => d.id !== deskId));
      setSuccessMessage('Desk deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete desk');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="buildings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buildings">Buildings</TabsTrigger>
          <TabsTrigger value="floors">Floors</TabsTrigger>
          <TabsTrigger value="desks">Desks</TabsTrigger>
        </TabsList>

        {/* Buildings Tab */}
        <TabsContent value="buildings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Buildings Management</h2>
            <Button onClick={() => setIsBuildingDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Building
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map((building) => (
                  <TableRow key={building.id}>
                    <TableCell className="font-medium">{building.name}</TableCell>
                    <TableCell>{building.address}</TableCell>
                    <TableCell>{building.city}</TableCell>
                    <TableCell>{building.country}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingBuilding(building);
                            setBuildingData(building);
                            setIsBuildingDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBuilding(building.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Floors Tab */}
        <TabsContent value="floors" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Floors Management</h2>
            <Button onClick={() => setIsFloorDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Floor
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Floor Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {floors.map((floor) => (
                  <TableRow key={floor.id}>
                    <TableCell className="font-medium">{floor.name}</TableCell>
                    <TableCell>
                      {buildings.find(b => b.id === floor.building_id)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{floor.floor_number}</TableCell>
                    <TableCell>
                      <Badge variant={floor.is_active ? "default" : "secondary"}>
                        {floor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingFloor(floor);
                            setFloorData(floor);
                            setIsFloorDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFloor(floor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Desks Tab */}
        <TabsContent value="desks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Desks Management</h2>
            <Button onClick={() => setIsDeskDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Desk
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Desk Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desks.map((desk) => (
                  <TableRow key={desk.id}>
                    <TableCell className="font-medium">{desk.desk_number}</TableCell>
                    <TableCell>
                      {floors.find(f => f.id === desk.floor_id)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{desk.desk_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          desk.status === 'available' ? 'default' : 
                          desk.status === 'occupied' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {desk.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ({desk.x_position}, {desk.y_position})
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDesk(desk);
                            setDeskData(desk);
                            setIsDeskDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDesk(desk.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Building Dialog */}
      <Dialog open={isBuildingDialogOpen} onOpenChange={setIsBuildingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBuilding ? 'Edit Building' : 'Add New Building'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="building-name">Name</Label>
              <Input
                id="building-name"
                value={buildingData.name || ''}
                onChange={(e) => setBuildingData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="building-address">Address</Label>
              <Textarea
                id="building-address"
                value={buildingData.address || ''}
                onChange={(e) => setBuildingData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="building-city">City</Label>
                <Input
                  id="building-city"
                  value={buildingData.city || ''}
                  onChange={(e) => setBuildingData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="building-country">Country</Label>
                <Input
                  id="building-country"
                  value={buildingData.country || ''}
                  onChange={(e) => setBuildingData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingBuilding ? handleUpdateBuilding : handleCreateBuilding}
                disabled={isSaving || !buildingData.name}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingBuilding ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBuildingDialogOpen(false);
                  setEditingBuilding(null);
                  setBuildingData({});
                }}
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floor Dialog */}
      <Dialog open={isFloorDialogOpen} onOpenChange={setIsFloorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFloor ? 'Edit Floor' : 'Add New Floor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="floor-name">Name</Label>
              <Input
                id="floor-name"
                value={floorData.name || ''}
                onChange={(e) => setFloorData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="floor-building">Building</Label>
              <Select
                value={floorData.building_id || ''}
                onValueChange={(value) => setFloorData(prev => ({ ...prev, building_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor-number">Floor Number</Label>
                <Input
                  id="floor-number"
                  type="number"
                  value={floorData.floor_number || ''}
                  onChange={(e) => setFloorData(prev => ({ ...prev, floor_number: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="floor-status">Status</Label>
                <Select
                  value={floorData.is_active?.toString() || 'true'}
                  onValueChange={(value) => setFloorData(prev => ({ ...prev, is_active: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="floor-description">Description</Label>
              <Textarea
                id="floor-description"
                value={floorData.description || ''}
                onChange={(e) => setFloorData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingFloor ? handleUpdateFloor : handleCreateFloor}
                disabled={isSaving || !floorData.name || !floorData.building_id || !floorData.floor_number}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingFloor ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFloorDialogOpen(false);
                  setEditingFloor(null);
                  setFloorData({});
                }}
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desk Dialog */}
      <Dialog open={isDeskDialogOpen} onOpenChange={setIsDeskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDesk ? 'Edit Desk' : 'Add New Desk'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desk-number">Desk Number</Label>
                <Input
                  id="desk-number"
                  value={deskData.desk_number || ''}
                  onChange={(e) => setDeskData(prev => ({ ...prev, desk_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="desk-floor">Floor</Label>
                <Select
                  value={deskData.floor_id || ''}
                  onValueChange={(value) => setDeskData(prev => ({ ...prev, floor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desk-type">Type</Label>
                <Select
                  value={deskData.desk_type || 'standard'}
                  onValueChange={(value) => setDeskData(prev => ({ ...prev, desk_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="standing">Standing</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desk-status">Status</Label>
                <Select
                  value={deskData.status || 'available'}
                  onValueChange={(value) => setDeskData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="desk-x">X Position</Label>
                <Input
                  id="desk-x"
                  type="number"
                  value={deskData.x_position || 0}
                  onChange={(e) => setDeskData(prev => ({ ...prev, x_position: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="desk-y">Y Position</Label>
                <Input
                  id="desk-y"
                  type="number"
                  value={deskData.y_position || 0}
                  onChange={(e) => setDeskData(prev => ({ ...prev, y_position: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="desk-width">Width</Label>
                <Input
                  id="desk-width"
                  type="number"
                  value={deskData.width || 100}
                  onChange={(e) => setDeskData(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="desk-height">Height</Label>
                <Input
                  id="desk-height"
                  type="number"
                  value={deskData.height || 100}
                  onChange={(e) => setDeskData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingDesk ? handleUpdateDesk : handleCreateDesk}
                disabled={isSaving || !deskData.desk_number || !deskData.floor_id}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingDesk ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeskDialogOpen(false);
                  setEditingDesk(null);
                  setDeskData({});
                }}
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFloorManagement; 