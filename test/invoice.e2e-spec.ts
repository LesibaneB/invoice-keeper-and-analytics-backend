import { JwtTokenDto } from './../src/auth/dto/jwt-token.dto';
import { InvoiceModule } from './../src/invoice/invoice.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ExtractEntitiesDto } from '../src/invoice/dto/extract-entities.dto';
import { INVOICE_TEXT_EMPTY } from '../src/invoice/utils/messages';
import {
  closeInMemoryMongoConnection,
  rootMongooseTestModule,
} from '../src/utils/mongo-inmemory-db-handler';
import { InvoiceModel } from '../src/invoice/models/invoice';
import * as faker from 'faker';
import { AccountRepository } from '../src/auth/repositories/account-repository';
import { OTPRepository } from '../src/auth/repositories/otp-repository';
import { CreateAccountDto } from '../src/auth/dto/create-account.dto';
import { VerifyAccountDTO } from '../src/auth/dto/verify-otp.dto';
import { AuthModule } from '../src/auth/auth.module';
import { InvoiceService } from '../src/invoice/services/invoice/invoice.service';

describe('Invoice E2E', () => {
  let app: INestApplication;
  let accountRepo: AccountRepository;
  let otpRepo: OTPRepository;

  const extractionResult: InvoiceModel = {
    storeName: 'Arthurs',
    storeAddress: '237 Washington Hoboken, NJ 07030',
    date: 'Oct-01-17',
    time: '01:44PM',
    total: 84.78,
    tax: 3.98,
    items: [
      {
        name: 'Arthurs Burger ChsBleu',
        price: 12,
        quantity: 1,
      },
      {
        name: 'Quesadilla',
        price: 8.95,
        quantity: 1,
      },
      {
        name: 'Pint Yeungling',
        price: 28.99,
        quantity: 2,
      },
    ],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AuthModule, InvoiceModule],
    })
      .overrideProvider('EmailSenderService')
      .useFactory({
        factory: () => ({
          sendOTPVericationEmail: jest.fn(() => true),
        }),
      })
      .compile();

    accountRepo = moduleFixture.get<AccountRepository>(AccountRepository);
    otpRepo = moduleFixture.get<OTPRepository>(OTPRepository);

    jest
      .spyOn(InvoiceService.prototype, 'extractEntities')
      .mockImplementation(async () => extractionResult);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => await closeInMemoryMongoConnection());

  it('/invoice/extract-data (POST) should successfully extract entities and return results when called with correct payload', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    return request(app.getHttpServer())
      .post('/invoice/extract-data')
      .send(extractionPayload)
      .expect(201, extractionResult);
  });

  it('/invoice/extract-data (POST) should fail to extract entities when called with empty invoiceText in payload', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText: '',
    };

    return request(app.getHttpServer())
      .post('/invoice/extract-data')
      .send(extractionPayload)
      .expect(400, {
        statusCode: 400,
        message: [INVOICE_TEXT_EMPTY],
        error: 'Bad Request',
      });
  });

  it('/invoice/upload (POST) should fail to upload and store invoice data when the user is not signed-in and is called with the correct payload.', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    return request(app.getHttpServer())
      .post('/invoice/extract-data')
      .send(extractionPayload)
      .expect(201, extractionResult)
      .then((result) => {
        const invoice = JSON.parse(result?.text);
        return request(app.getHttpServer())
          .post('/invoice/upload')
          .set(
            'Authorization',
            `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI2MDc2MGU2MGMxMDEyMDMzN2NiOTRiZDAiLCJmaXJzdE5hbWUiOiJCb25ha2VsZSIsImxhc3ROYW1lIjoiTGVzaWJhbmUiLCJlbWFpbEFkZHJlc3MiOiJib25ha2VsZS5sZXNpYmFuZUBnbWFpbC5jb20iLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjE5MjIxNzIyLCJleHAiOjE2MTkyMjUzMjJ9.LdGLRtjCk1gF972eNo_xui3Si0wVWGZ5bkWWcDuEWT9`,
          )
          .send(invoice)
          .expect(401);
      });
  });

  it('/invoice/upload (POST) should successfully upload and store invoice data when the user is signed-in and is called with the correct payload.', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };
    let jwt: JwtTokenDto;

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(async () => {
        const account = await accountRepo.findByEmailAddress(emailAddress);
        expect(account).toBeDefined();

        const otp = await otpRepo.find(account._id);
        expect(otp).toBeDefined();

        const accountVerificationPayload: VerifyAccountDTO = {
          emailAddress: account.emailAddress,
          otp: otp.otp,
        };

        return request(app.getHttpServer())
          .post('/auth/account/verify')
          .send(accountVerificationPayload)
          .expect(201)
          .then(() => {
            const signInPayload = {
              emailAddress: accountVerificationPayload.emailAddress,
              password,
            };

            return request(app.getHttpServer())
              .post('/auth/sign-in')
              .send(signInPayload)
              .expect(201)
              .then((signInResult) => {
                jwt = JSON.parse(signInResult?.text);
                return request(app.getHttpServer())
                  .post('/invoice/extract-data')
                  .send(extractionPayload)
                  .expect(201, extractionResult)
                  .then((invoiceExtractionResult) => {
                    const invoice = JSON.parse(invoiceExtractionResult?.text);
                    return request(app.getHttpServer())
                      .post('/invoice/upload')
                      .set('Authorization', `Bearer ${jwt.access_token}`)
                      .send(invoice)
                      .expect(201);
                  });
              });
          });
      });
  });

  it('/invoice (GET) should fail to retrieve all invoices for the user when the user not signed-in.', () => {
    return request(app.getHttpServer())
      .get('/invoice')
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI2MDc2MGU2MGMxMDEyMDMzN2NiOTRiZDAiLCJmaXJzdE5hbWUiOiJCb25ha2VsZSIsImxhc3ROYW1lIjoiTGVzaWJhbmUiLCJlbWFpbEFkZHJlc3MiOiJib25ha2VsZS5sZXNpYmFuZUBnbWFpbC5jb20iLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjE5MjIxNzIyLCJleHAiOjE2MTkyMjUzMjJ9.LdGLRtjCk1gF972eNo_xui3Si0wVWGZ5bkWWcDuEWT9`,
      )
      .expect(401);
  });

  it('/invoice (GET) should successfully retrieve all invoices for the user when the user is signed-in.', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };
    let jwt: JwtTokenDto;

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(async () => {
        const account = await accountRepo.findByEmailAddress(emailAddress);
        expect(account).toBeDefined();

        const otp = await otpRepo.find(account._id);
        expect(otp).toBeDefined();

        const accountVerificationPayload: VerifyAccountDTO = {
          emailAddress: account.emailAddress,
          otp: otp.otp,
        };

        return request(app.getHttpServer())
          .post('/auth/account/verify')
          .send(accountVerificationPayload)
          .expect(201)
          .then(() => {
            const signInPayload = {
              emailAddress: accountVerificationPayload.emailAddress,
              password,
            };

            return request(app.getHttpServer())
              .post('/auth/sign-in')
              .send(signInPayload)
              .expect(201)
              .then((signInResult) => {
                jwt = JSON.parse(signInResult?.text);
                return request(app.getHttpServer())
                  .post('/invoice/extract-data')
                  .send(extractionPayload)
                  .expect(201, extractionResult)
                  .then((invoiceExtractionResult) => {
                    const invoice = JSON.parse(invoiceExtractionResult?.text);
                    return request(app.getHttpServer())
                      .post('/invoice/upload')
                      .set('Authorization', `Bearer ${jwt.access_token}`)
                      .send(invoice)
                      .expect(201)
                      .then(() => {
                        return request(app.getHttpServer())
                          .get('/invoice')
                          .set('Authorization', `Bearer ${jwt.access_token}`)
                          .send(invoice)
                          .expect(200)
                          .then((fetchAllInvoiceResult) => {
                            const invoices = JSON.parse(
                              fetchAllInvoiceResult?.text,
                            );
                            expect(invoices.length).toBe(1);
                          });
                      });
                  });
              });
          });
      });
  });

  it('/invoice?invoiceId (GET) should fail to retrieve an invoice for the user when the user not signed-in.', () => {
    return request(app.getHttpServer())
      .get('/invoice')
      .query({ invoiceId: 1 })
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI2MDc2MGU2MGMxMDEyMDMzN2NiOTRiZDAiLCJmaXJzdE5hbWUiOiJCb25ha2VsZSIsImxhc3ROYW1lIjoiTGVzaWJhbmUiLCJlbWFpbEFkZHJlc3MiOiJib25ha2VsZS5sZXNpYmFuZUBnbWFpbC5jb20iLCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjE5MjIxNzIyLCJleHAiOjE2MTkyMjUzMjJ9.LdGLRtjCk1gF972eNo_xui3Si0wVWGZ5bkWWcDuEWT9`,
      )
      .expect(401);
  });

  it('/invoice?invoiceId (GET) should successfully retrieve an invoice for the user when the user is signed-in.', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    const password = faker.internet.password();
    const emailAddress = faker.internet.email();
    const createAccountParams: CreateAccountDto = {
      firstName: faker.name.findName(),
      lastName: faker.name.lastName(),
      emailAddress,
      password,
      confirmPassword: password,
    };
    let jwt: JwtTokenDto;

    return request(app.getHttpServer())
      .post('/auth/account')
      .send(createAccountParams)
      .expect(201)
      .then(async () => {
        const account = await accountRepo.findByEmailAddress(emailAddress);
        expect(account).toBeDefined();

        const otp = await otpRepo.find(account._id);
        expect(otp).toBeDefined();

        const accountVerificationPayload: VerifyAccountDTO = {
          emailAddress: account.emailAddress,
          otp: otp.otp,
        };

        return request(app.getHttpServer())
          .post('/auth/account/verify')
          .send(accountVerificationPayload)
          .expect(201)
          .then(() => {
            const signInPayload = {
              emailAddress: accountVerificationPayload.emailAddress,
              password,
            };

            return request(app.getHttpServer())
              .post('/auth/sign-in')
              .send(signInPayload)
              .expect(201)
              .then((signInResult) => {
                jwt = JSON.parse(signInResult?.text);
                return request(app.getHttpServer())
                  .post('/invoice/extract-data')
                  .send(extractionPayload)
                  .expect(201, extractionResult)
                  .then((invoiceExtractionResult) => {
                    const invoice = JSON.parse(invoiceExtractionResult?.text);
                    return request(app.getHttpServer())
                      .post('/invoice/upload')
                      .set('Authorization', `Bearer ${jwt.access_token}`)
                      .send(invoice)
                      .expect(201)
                      .then(() => {
                        return request(app.getHttpServer())
                          .get('/invoice')
                          .set('Authorization', `Bearer ${jwt.access_token}`)
                          .expect(200)
                          .then((fetchAllInvoiceResult) => {
                            const invoices = JSON.parse(
                              fetchAllInvoiceResult?.text,
                            );
                            expect(invoices.length).toBe(1);

                            return request(app.getHttpServer())
                              .get('/invoice')
                              .query({ invoiceId: invoices[0]._id })
                              .set(
                                'Authorization',
                                `Bearer ${jwt.access_token}`,
                              )
                              .expect(200);
                          });
                      });
                  });
              });
          });
      });
  });
});
