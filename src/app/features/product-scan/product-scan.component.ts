import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCreateDTO } from '../../models/product.model';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-product-scan',
  templateUrl: './product-scan.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent
  ]
})
export class ProductScanComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  
  isCapturing = true;
  isLoading = false;
  errorMessage: string | null = null;
  stream: MediaStream | null = null;
  
  productForm: FormGroup = this.fb.group({
    barcode: ['', Validators.required],
    name: ['', Validators.required],
    brand: [''],
    size: ['', [Validators.required, Validators.min(0)]],
    unit: ['g', Validators.required],
    categoryId: ['other', Validators.required],
    consumptionRate: ['medium', Validators.required]
  });
  
  ngAfterViewInit(): void {
    this.startCamera();
  }
  
  ngOnDestroy(): void {
    this.stopCamera();
  }
  
  async startCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorMessage = 'No se pudo acceder a la cámara. Por favor, verifica los permisos.';
    }
  }
  
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }
  
  captureImage(): void {
    if (!this.videoElement || !this.canvasElement) {
      return;
    }
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    if (!context) {
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.processBarcode('sample-barcode-12345');
  }
  
  processBarcode(barcode: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Set the barcode in the form
    this.productForm.patchValue({ barcode });
    
    // Check if the product already exists
    this.productService.getProductByBarcode(barcode)
      .subscribe({
        next: (product) => {
          this.isLoading = false;
          
          if (product) {
            // Product exists, prefill the form
            this.productForm.patchValue({
              name: product.name,
              brand: product.brand || '',
              size: product.size || '',
              unit: product.unit || 'g',
              categoryId: product.categoryId || 'other',
              consumptionRate: product.consumptionRate || 'medium'
            });
          }
          
          // Switch to form view
          this.isCapturing = false;
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = `Error al buscar el producto: ${err.message}`;
        }
      });
  }
  
  submitProduct(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    const productData: ProductCreateDTO = {
      ...this.productForm.value
    };
    
    this.productService.createProduct(productData)
      .subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err: Error) => {
          this.isLoading = false;
          this.errorMessage = `Error al guardar el producto: ${err.message}`;
        }
      });
  }
  
  retryCapture(): void {
    this.isCapturing = true;
    this.productForm.reset({
      barcode: '',
      name: '',
      brand: '',
      size: '',
      unit: 'g',
      categoryId: 'other',
      consumptionRate: 'medium'
    });
    
    if (!this.stream) {
      this.startCamera();
    }
  }
}