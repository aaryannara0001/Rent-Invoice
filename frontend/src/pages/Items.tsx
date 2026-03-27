import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/context/useApp';
import { toast } from 'sonner';
import { MasterItem } from '@/context/types';

const Items = () => {
	const { masterItems, addMasterItem, updateMasterItem, deleteMasterItem } = useApp();
	const [searchTerm, setSearchTerm] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		pricePerDay: 0,
		gstPercent: 18,
		category: 'General',
	});

	const categories = ['General', 'Equipment', 'Furniture', 'Electronics', 'Labor', 'Other'];

	const filteredItems = masterItems.filter(item =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
		item.category?.toLowerCase().includes(searchTerm.toLowerCase())
	);
 
	const handleSearch = () => {
		setSearchTerm(searchQuery);
	};
 
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleOpenAddDialog = () => {
		setEditingItem(null);
		setFormData({
			name: '',
			description: '',
			pricePerDay: 0,
			gstPercent: 18,
			category: 'General',
		});
		setAddItemDialogOpen(true);
	};

	const handleOpenEditDialog = (item: MasterItem) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			description: item.description,
			pricePerDay: item.pricePerDay,
			gstPercent: item.gstPercent,
			category: item.category || 'General',
		});
		setAddItemDialogOpen(true);
	};

	const handleSaveItem = () => {
		if (!formData.name || formData.pricePerDay < 0) {
			toast.error('Please fill in all required fields correctly');
			return;
		}

		if (editingItem) {
			updateMasterItem(editingItem.id, {
				...editingItem,
				...formData,
				updatedAt: new Date().toISOString(),
			});
			toast.success('Item updated successfully');
		} else {
			const newItem: MasterItem = {
				id: `ITEM-${Date.now()}`,
				...formData,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			addMasterItem(newItem);
			toast.success('Item added successfully');
		}

		setAddItemDialogOpen(false);
	};

	const handleDeleteItem = () => {
		if (itemToDelete) {
			deleteMasterItem(itemToDelete);
			setDeleteDialogOpen(false);
			setItemToDelete(null);
			toast.success('Item deleted successfully');
		}
	};

	return (
		<MainLayout>
			<div className="p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Package className="h-8 w-8 text-blue-500" />
						<h1 className="text-3xl font-bold text-white">Rental Items</h1>
					</div>
					<Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpenAddDialog}>
						<Plus className="h-4 w-4 mr-2" />
						Add Item
					</Button>
				</div>

				{/* Search */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-6">
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search items by name, description, or category..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={handleKeyPress}
									className="pl-10 bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								/>
							</div>
							<Button 
								onClick={handleSearch}
								className="bg-[#1F2937] border-[#1F2937] text-gray-300 hover:bg-[#374151]"
							>
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
							{searchTerm && (
								<Button 
									variant="ghost" 
									onClick={() => {
										setSearchQuery('');
										setSearchTerm('');
									}}
									className="text-gray-400 hover:text-gray-300"
								>
									Clear
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Table */}
				<Card className="bg-[#111827] border-[#1F2937]">
					<CardContent className="p-0">
						{filteredItems.length === 0 ? (
							<div className="text-center py-12">
								<Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
								<p className="text-gray-500">No items found. Add items to build your rental catalog.</p>
								<Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpenAddDialog}>
									<Plus className="h-4 w-4 mr-2" />
									Add First Item
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-[#1F2937] hover:bg-[#1F2937]/50">
											<TableHead className="text-gray-300">Name</TableHead>
											<TableHead className="text-gray-300">Category</TableHead>
											<TableHead className="text-gray-300">Price / Day</TableHead>
											<TableHead className="text-gray-300">GST %</TableHead>
											<TableHead className="text-gray-300">Description</TableHead>
											<TableHead className="text-gray-300 text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredItems.map((item) => (
											<TableRow key={item.id} className="border-[#1F2937] hover:bg-[#1F2937]/30 transition-colors">
												<TableCell className="text-gray-300 font-medium">{item.name}</TableCell>
												<TableCell className="text-gray-300">
													<Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
														{item.category || 'General'}
													</Badge>
												</TableCell>
												<TableCell className="text-gray-300 font-semibold">₹{item.pricePerDay.toFixed(2)}</TableCell>
												<TableCell className="text-gray-300">{item.gstPercent}%</TableCell>
												<TableCell className="text-gray-300 text-sm max-w-xs truncate">{item.description}</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
															onClick={() => handleOpenEditDialog(item)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
															onClick={() => {
																setItemToDelete(item.id);
																setDeleteDialogOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add/Edit Item Dialog */}
			<Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">{editingItem ? 'Edit Rental Item' : 'Add Rental Item'}</DialogTitle>
						<DialogDescription className="text-gray-400">
							{editingItem ? 'Update item details in your catalog' : 'Add a new item to your rental catalog'}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-gray-300">Item Name *</Label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
									className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
									placeholder="e.g. Sony A7III"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-gray-300">Category</Label>
								<Select 
									value={formData.category} 
									onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
								>
									<SelectTrigger className="bg-[#0B0F19] border-[#1F2937] text-gray-300">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent className="bg-[#111827] border-[#1F2937]">
										{categories.map(cat => (
											<SelectItem key={cat} value={cat} className="text-gray-300">{cat}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-gray-300">Price Per Day (₹) *</Label>
								<Input
									type="number"
									value={formData.pricePerDay}
									onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) || 0 }))}
									className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
									min="0"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-gray-300">GST %</Label>
								<Input
									type="number"
									value={formData.gstPercent}
									onChange={(e) => setFormData(prev => ({ ...prev, gstPercent: parseFloat(e.target.value) || 0 }))}
									className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
									min="0"
									max="100"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-gray-300">Description</Label>
							<Textarea
								value={formData.description}
								onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
								className="bg-[#0B0F19] border-[#1F2937] text-gray-300 placeholder-gray-500"
								placeholder="Item specifications and details..."
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setAddItemDialogOpen(false)} className="border-[#1F2937] text-gray-300 hover:bg-[#1F2937]">
							Cancel
						</Button>
						<Button onClick={handleSaveItem} className="bg-blue-600 hover:bg-blue-700 text-white">
							{editingItem ? 'Update' : 'Add'} Item
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="bg-[#111827] border-[#1F2937]">
					<DialogHeader>
						<DialogTitle className="text-white">Delete Item</DialogTitle>
						<DialogDescription className="text-gray-400">
							Are you sure you want to delete this item? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-[#1F2937] text-gray-300 hover:bg-[#1F2937]">
							Cancel
						</Button>
						<Button onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700 text-white">
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</MainLayout>
	);
};

export default Items;
