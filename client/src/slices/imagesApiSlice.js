import { wodmatchApiSlice } from "../app/api/apiSlice";

// Cache en mémoire des blob URLs pour éviter les requêtes répétées
const blobUrlCache = new Map();

export const imagesApiSlice = wodmatchApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getImage: builder.query({
      query: (filename) => ({
        url: `/images/get-one-image/${filename}`,
        responseHandler: async (response) => {
          // Vérifier si on a déjà une blob URL en cache
          if (blobUrlCache.has(filename)) {
            return blobUrlCache.get(filename);
          }
          
          // Convertir la réponse en blob
          const blob = await response.blob();
          // Créer une URL à partir du blob
          const blobUrl = URL.createObjectURL(blob);
          
          // Mettre en cache
          blobUrlCache.set(filename, blobUrl);
          
          return blobUrl;
        },
        validateStatus: (response) => response.ok,
      }),
      providesTags: ['User', 'Image'],
      keepUnusedDataFor: 86400, // 24h en secondes
    }),
    getUserTempImages: builder.query({
      query: () => '/images/get-user-temp-images',
      providesTags: ['Image'],
    }),
    uploadTempImages: builder.mutation({
      query: ({ files, slot }) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        if (slot !== undefined && slot !== null) {
          formData.append('slot', slot);
        }
        return {
          url: '/images/upload-temp-images',
          method: 'POST',
          body: formData,
        };
      },
    }),
    reorderTempImages: builder.mutation({
      query: data => ({
          url: '/images/reorder-temp-images',
          method: 'post',
          body: {
              ...data,
          }
      }),
      invalidatesTags: ['Image']
    }),
    deleteTempImage: builder.mutation({
      query: (filename) => ({
        url: `/images/delete-temp-image/${encodeURIComponent(filename)}`,
        method: 'DELETE',
        invalidatesTags: ['Image']
      }),
    }),
  }),
})

export const { 
  useGetImageQuery, useUploadTempImagesMutation, useGetUserTempImagesQuery, useDeleteTempImageMutation,
  useReorderTempImagesMutation
} = imagesApiSlice

// Fonction utilitaire pour nettoyer le cache (à appeler lors de la déconnexion)
export const clearImageCache = () => {
  blobUrlCache.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  blobUrlCache.clear();
};