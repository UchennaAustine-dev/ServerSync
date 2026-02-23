# Menu Item Image Upload Implementation

## Overview

This document describes the implementation of menu item image upload functionality for restaurant owners, fulfilling task 9.2 and requirement 4.5 of the frontend-backend integration spec.

## Components

### 1. ImageUpload Component (`components/restaurant/ImageUpload.tsx`)

A reusable image upload component with the following features:

- **Drag and Drop**: Users can drag image files onto the component
- **Click to Upload**: Traditional file input via click
- **Image Preview**: Shows preview of selected image before upload
- **Validation**:
  - File type: JPG, PNG, WebP only
  - File size: Maximum 5MB
  - Clear error messages for invalid files
- **Current Image Display**: Shows existing image if available
- **Remove Image**: Button to clear selected/current image

**Props:**

- `onImageSelect: (file: File) => void` - Callback when valid image is selected
- `currentImageUrl?: string` - URL of existing image to display
- `disabled?: boolean` - Disable upload during form submission

### 2. Updated MenuItemForm Component

The MenuItemForm component has been updated to:

- Include the ImageUpload component
- Accept an optional `imageFile` parameter in the `onSubmit` callback
- Pass the selected image file to the parent component
- Display current image when editing existing items

**Updated Signature:**

```typescript
interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: CreateMenuItemRequest, imageFile?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### 3. React Query Hook

Added `useUploadMenuItemImage` hook in `lib/hooks/restaurant.hooks.ts`:

```typescript
export function useUploadMenuItemImage(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      restaurantService.uploadMenuItemImage(restaurantId, itemId, file),
    onSuccess: () => {
      // Invalidate menu query to refetch with updated image URL
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });
    },
  });
}
```

## Integration Flow

### Creating a New Menu Item with Image

1. User fills out menu item form
2. User selects/drops an image file
3. ImageUpload validates the file (type, size)
4. User submits the form
5. Menu item is created via `createMenuItem` mutation
6. If image was selected, `uploadMenuItemImage` is called with the new item ID
7. Menu cache is invalidated and refetched
8. Success/error toast is displayed

### Updating an Existing Menu Item with Image

1. User opens edit form for existing menu item
2. Current image is displayed (if exists)
3. User can select a new image to replace it
4. User submits the form
5. Menu item is updated via `updateMenuItem` mutation
6. If new image was selected, `uploadMenuItemImage` is called
7. Menu cache is invalidated and refetched
8. Success/error toast is displayed

## Error Handling

The implementation includes comprehensive error handling:

1. **Client-side Validation**:
   - Invalid file type → Error message displayed in ImageUpload
   - File too large → Error message displayed in ImageUpload

2. **Upload Failures**:
   - Menu item created but image upload fails → Warning toast, item saved without image
   - Menu item updated but image upload fails → Warning toast, updates saved without new image

3. **Graceful Degradation**:
   - Images are optional - menu items can be created/updated without images
   - Missing images show placeholder emoji in menu management
   - MenuItemCard component already handles missing images gracefully

## Display

### Restaurant Owner View (Menu Management)

Menu items in the management dashboard display:

- Uploaded image (if available)
- Placeholder emoji (if no image)
- 80x80px rounded thumbnail

### Customer View (Restaurant Menu)

Menu items in the customer-facing menu display:

- Full image in 192px width sidebar (if available)
- Hover effects and transitions
- Graceful fallback if no image

## API Integration

The implementation uses the existing `restaurantService.uploadMenuItemImage` method:

```typescript
async uploadMenuItemImage(
  restaurantId: string,
  itemId: string,
  file: File,
): Promise<{ imageUrl: string }>
```

**Endpoint**: `POST /restaurants/:restaurantId/menu/:itemId/image`
**Content-Type**: `multipart/form-data`
**Request Body**: FormData with `image` field containing the file

## Requirements Fulfilled

✅ **Requirement 4.4**: API_Client handles multipart/form-data encoding
✅ **Requirement 4.5**: Restaurant owners can upload menu item images
✅ Image upload component with drag & drop
✅ Image preview functionality
✅ Image validation (type, size)
✅ Display uploaded images in menu
✅ Error handling with user feedback
✅ Cache invalidation after upload

## Future Enhancements

Potential improvements for future iterations:

1. **Image Cropping**: Allow users to crop/resize images before upload
2. **Multiple Images**: Support multiple images per menu item
3. **Image Optimization**: Client-side image compression before upload
4. **Progress Indicator**: Show upload progress for large files
5. **Bulk Upload**: Upload images for multiple items at once
6. **Image Library**: Reuse images across menu items
