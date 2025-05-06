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
  
  // Category-specific field visibility
  showSizeAndUnit = true;
  
  productForm: FormGroup = this.fb.group({
    barcode: ['', Validators.required],
    name: ['', Validators.required],
    brand: [''],
    categoryId: ['other', Validators.required],
    size: [''],
    unit: ['g'],
    consumptionRate: ['medium', Validators.required],
    // New fields
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchaseLocation: [''],
    discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
    finalPrice: [{ value: 0, disabled: true }]
  });
  
  ngAfterViewInit(): void {
    this.startCamera();
    this.setupFormListeners();
  }
  
  ngOnDestroy(): void {
    this.stopCamera();
  }
  
  setupFormListeners(): void {
    // Listen for category changes to update form fields visibility
    this.productForm.get('categoryId')?.valueChanges.subscribe(category => {
      this.updateFormBasedOnCategory(category);
    });
    
    // Calculate final price when price, quantity or discount changes
    const priceControl = this.productForm.get('price');
    const quantityControl = this.productForm.get('quantity');
    const discountControl = this.productForm.get('discountPercentage');
    
    if (priceControl && quantityControl && discountControl) {
      priceControl.valueChanges.subscribe(() => this.calculateFinalPrice());
      quantityControl.valueChanges.subscribe(() => this.calculateFinalPrice());
      discountControl.valueChanges.subscribe(() => this.calculateFinalPrice());
    }
  }
  
  updateFormBasedOnCategory(category: string): void {
    // Categories that need size and unit
    const foodCategories = ['dairy', 'grains', 'meat', 'produce', 'canned', 'snacks', 'beverages'];
    
    this.showSizeAndUnit = foodCategories.includes(category);
    
    if (this.showSizeAndUnit) {
      this.productForm.get('size')?.setValidators([Validators.required, Validators.min(0)]);
      this.productForm.get('unit')?.setValidators([Validators.required]);
    } else {
      this.productForm.get('size')?.clearValidators();
      this.productForm.get('unit')?.clearValidators();
      // Reset the values
      this.productForm.patchValue({
        size: '',
        unit: ''
      });
    }
    
    this.productForm.get('size')?.updateValueAndValidity();
    this.productForm.get('unit')?.updateValueAndValidity();
  }
  
  calculateFinalPrice(): void {
    const price = this.productForm.get('price')?.value || 0;
    const quantity = this.productForm.get('quantity')?.value || 1;
    const discount = this.productForm.get('discountPercentage')?.value || 0;
    
    let finalPrice = price * quantity;
    if (discount > 0) {
      finalPrice = finalPrice * (1 - discount / 100);
    }
    
    // Round to 2 decimal places
    finalPrice = Math.round((finalPrice + Number.EPSILON) * 100) / 100;
    
    this.productForm.get('finalPrice')?.setValue(finalPrice);
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
              categoryId: product.categoryId || 'other',
              size: product.size || '',
              unit: product.unit || 'g',
              consumptionRate: product.consumptionRate || 'medium',
              price: product.price || 0,
              quantity: product.quantity || 1,
              purchaseLocation: product.purchaseLocation || '',
              discountPercentage: product.discountPercentage || 0
            });
            
            // Update form fields visibility based on category
            this.updateFormBasedOnCategory(product.categoryId || 'other');
            
            // Calculate final price
            this.calculateFinalPrice();
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
    
    // Get form values and add the calculated final price
    const formValues = this.productForm.getRawValue();
    const productData: ProductCreateDTO = {
      ...formValues,
      finalPrice: formValues.finalPrice
    };
    
    // Remove size and unit if not needed for this category
    if (!this.showSizeAndUnit) {
      delete productData.size;
      delete productData.unit;
    }
    
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
      categoryId: 'other',
      size: '',
      unit: 'g',
      consumptionRate: 'medium',
      price: 0,
      quantity: 1,
      purchaseLocation: '',
      discountPercentage: 0,
      finalPrice: 0
    });
    
    if (!this.stream) {
      this.startCamera();
    }
  }
}