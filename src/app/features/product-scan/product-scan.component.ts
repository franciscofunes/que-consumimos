import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Store } from '@ngrx/store';
import { addProduct } from '../../store/product/product.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-scan',
  templateUrl: './product-scan.component.html'
})
export class ProductScanComponent implements OnInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  private store = inject(Store);
  private productService = inject(ProductService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  isCapturing = true;
  scannedBarcode: string | null = null;
  productForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  
  ngOnInit(): void {
    this.initForm();
    this.startCamera();
  }
  
  private initForm(): void {
    this.productForm = this.fb.group({
      barcode: ['', Validators.required],
      name: ['', Validators.required],
      brand: [''],
      size: [0, [Validators.required, Validators.min(0)]],
      unit: ['g', Validators.required],
      categoryId: ['other', Validators.required],
      consumptionRate: ['medium']
    });
  }
  
  private startCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      }).then(stream => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        }
      }).catch(err => {
        console.error('Error accessing camera:', err);
        this.errorMessage = 'No se pudo acceder a la cámara. Por favor, verifica los permisos.';
      });
    } else {
      this.errorMessage = 'Tu dispositivo no soporta acceso a la cámara.';
    }
  }
  
  captureImage(): void {
    if (!this.videoElement || !this.canvasElement) return;
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop capturing
    this.isCapturing = false;
    
    // Here you would typically process the image to detect a barcode
    // For now, let's simulate finding a barcode
    this.simulateBarcodeDetection();
  }
  
  // This is a placeholder - in a real app, you'd use a barcode scanning library
  private simulateBarcodeDetection(): void {
    // Simulate processing delay
    this.isLoading = true;
    
    setTimeout(() => {
      // Generate a random barcode for demo purposes
      const barcode = Math.floor(Math.random() * 10000000000000).toString();
      
      this.scannedBarcode = barcode;
      this.productForm.patchValue({ barcode });
      
      // Check if product already exists
      this.checkIfProductExists(barcode);
      
      this.isLoading = false;
    }, 1500);
  }
  
  private checkIfProductExists(barcode: string): void {
    this.productService.getProductByBarcode(barcode).subscribe({
      next: product => {
        if (product) {
          // Product exists, navigate to its details
          this.router.navigate(['/product-detail', product.id]);
        }
        // Otherwise, user will fill the form to add a new product
      },
      error: err => {
        console.error('Error checking product:', err);
      }
    });
  }
  
  retryCapture(): void {
    this.isCapturing = true;
    this.scannedBarcode = null;
    this.errorMessage = null;
  }
  
  submitProduct(): void {
    if (this.productForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }
    
    this.isLoading = true;
    
    const newProduct: Product = {
      ...this.productForm.value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.store.dispatch(addProduct({ product: newProduct }));
    
    // Navigate back to product list
    this.router.navigate(['/products']);
  }
}
